import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener un empleado por ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const empleado = await prisma.employee.findUnique({
    where: { id: params.id }
  });

  if (!empleado) {
    return Response.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  return Response.json(empleado);
}

// Editar empleado
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { nombre, cargo, area, correo_electronico } = body;

  const empleado = await prisma.employee.update({
    where: { id: params.id },
    data: { nombre, cargo, area, correo_electronico }
  });

  return Response.json(empleado);
}

// Eliminar empleado
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.employee.delete({
    where: { id: params.id }
  });

  return Response.json({ mensaje: "Empleado eliminado correctamente" });
}