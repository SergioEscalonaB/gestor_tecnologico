import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener un mantenimiento por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber },
    include: { activo: true }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  return Response.json(mantenimiento);
}

// Finalizar mantenimiento — el activo vuelve a disponible
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);
  const body = await req.json();
  const { tipo, descripcion, fecha_programada, responsable, estado } = body;

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  // Actualiza el mantenimiento y libera el activo
  const [mantenimientoActualizado] = await prisma.$transaction([
    prisma.maintenance.update({
      where: { id: idNumber },
      data: { tipo, descripcion, fecha_programada : new Date(fecha_programada), responsable, estado }
    }),
    prisma.asset.update({
      where: { id: mantenimiento.activoId },
      data: { estado: "disponible" } // EL activo vuelve a disponible
    })
  ]);

  return Response.json(mantenimientoActualizado);
}

// Eliminar mantenimiento
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  await prisma.maintenance.delete({ where: { id: idNumber } });

  return Response.json({ mensaje: "Mantenimiento eliminado correctamente" });
}