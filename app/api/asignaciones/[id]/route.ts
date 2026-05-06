import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener una asignación por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const asignacion = await prisma.assignment.findUnique({
    where: { id: idNumber },
    include: { activo: true, empleado: true }
  });

  if (!asignacion) {
    return Response.json({ error: "Asignación no encontrada" }, { status: 404 });
  }

  return Response.json(asignacion);
}

// Finalizar asignación — le pone fecha_fin y libera el activo
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  // Busca la asignación para saber qué activo liberar
  const asignacion = await prisma.assignment.findUnique({
    where: { id: idNumber }
  });

  if (!asignacion) {
    return Response.json({ error: "Asignación no encontrada" }, { status: 404 });
  }

  if (asignacion.fecha_fin) {
    return Response.json(
      { error: "Esta asignación ya fue finalizada" },
      { status: 400 }
    );
  }

  // Finaliza la asignación y libera el activo en una sola transacción
  const [asignacionActualizada] = await prisma.$transaction([
    prisma.assignment.update({
      where: { id: idNumber },
      data: { fecha_fin: new Date() } // marca cuando se devolvió
    }),
    prisma.asset.update({
      where: { id: asignacion.activo_id },
      data: { estado: "disponible" } //el activo queda libre
    })
  ]);

  return Response.json(asignacionActualizada);
}

// Eliminar asignación
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const asignacion = await prisma.assignment.findUnique({
    where: { id: idNumber }
  });

  if (!asignacion) {
    return Response.json({ error: "Asignación no encontrada" }, { status: 404 });
  }

  // Si la asignación estaba activa, libera el activo
  if (!asignacion.fecha_fin) {
    await prisma.asset.update({
      where: { id: asignacion.activo_id },
      data: { estado: "disponible" }
    });
  }

  await prisma.assignment.delete({ where: { id: idNumber } });

  return Response.json({ mensaje: "Asignación eliminada correctamente" });
}