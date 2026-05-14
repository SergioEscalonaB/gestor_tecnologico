import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener un empleado por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const empleado = await prisma.employee.findUnique({
    where: { id: idNumber },
    include: {
      // Obtenemos todos los activos asignados al empleado, tanto activos como desasignados
      activosResponsable: true,
      asignaciones: {
        include: { activo: true },
        orderBy: { fecha_inicio: "desc" },
      },
    },
  });

  if (!empleado) {
    return Response.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  return Response.json(empleado);
}

// Actualizar un empleado por ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  if (Number.isNaN(idNumber)) {
    return Response.json({ error: "ID de empleado inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { cedula, nombre, cargo, area, correo_electronico } = body;

  if (!nombre || !cargo || !area || !correo_electronico) {
    return Response.json(
      { error: "Nombre, cargo, área y correo son obligatorios" },
      { status: 400 },
    );
  }

  const empleadoActual = await prisma.employee.findUnique({
    where: { id: idNumber },
    select: { cedula: true },
  });

  if (!empleadoActual) {
    return Response.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  const cedulaNueva =
    cedula !== undefined && cedula !== null && cedula !== ""
      ? Number(cedula)
      : empleadoActual.cedula;

  if (Number.isNaN(cedulaNueva)) {
    return Response.json(
      { error: "La cédula debe ser un número válido" },
      { status: 400 },
    );
  }

  try {
    const empleado = await prisma.employee.update({
      where: { id: idNumber },
      data: { cedula: cedulaNueva, nombre, cargo, area, correo_electronico },
    });

    return Response.json(empleado);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return Response.json(
        { error: "La cédula o el correo electrónico ya están registrados" },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "No se pudo actualizar el empleado" },
      { status: 500 },
    );
  }
}

//  Desactivar un empleado por ID
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const empleado = await prisma.employee.update({
    where: { id: idNumber },
    data: { activo: false }
  });

  return Response.json(empleado);
}
