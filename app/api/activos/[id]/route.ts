import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener un activo por ID con sus mantenimientos y asignación actual
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const activo = await prisma.asset.findUnique({
    where: { id: idNumber },
    include: {
      mantenimientos: { orderBy: { fecha: "desc" } }, // historial de mantenimientos
      asignaciones: {
        where: { fecha_fin: null }, // solo la asignación activa
        include: { empleado: true }
      }
    }
  });

  if (!activo) {
    return Response.json({ error: "Activo no encontrado" }, { status: 404 });
  }

  return Response.json(activo);
}

// Editar activo
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);
  
  const body = await req.json();
  const { nombre, tipo, marca, modelo, numero_serie, estado, fecha_compra } = body;

  const activo = await prisma.asset.update({
    where: { id: idNumber },
    data: {
      nombre, tipo, marca, modelo,
      numero_serie, estado,
      fecha_compra: new Date(fecha_compra)
    }
  });

  return Response.json(activo);
}

// Eliminar activo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  await prisma.asset.delete({
    where: { id: idNumber }
  });

  return Response.json({ mensaje: "Activo eliminado correctamente" });
}