import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// GET /api/empleados/:id - Obtener un empleado por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const empleado = await prisma.employee.findUnique({
    where: { id: idNumber }
  });

  if (!empleado) {
    return Response.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  return Response.json(empleado);
}

// PUT /api/empleados/:id - Actualizar un empleado por ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; 
  const idNumber = parseInt(id);
  
  const body = await req.json();
  const { nombre, cargo, area, correo_electronico } = body;

  const empleado = await prisma.employee.update({
    where: { id: idNumber },
    data: { nombre, cargo, area, correo_electronico }
  });

  return Response.json(empleado);
}

// DELETE /api/empleados/:id - Eliminar un empleado por ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  await prisma.employee.delete({
    where: { id: idNumber }
  });

  return Response.json({ mensaje: "Empleado eliminado correctamente" });
}