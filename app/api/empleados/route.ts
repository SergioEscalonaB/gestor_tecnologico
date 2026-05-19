import { prisma } from "@/lib/prisma";

// Obtener todos los empleados
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const soloActivos = searchParams.get("solo_activos") === "true";

  const empleados = await prisma.employee.findMany({
    where: soloActivos ? { activo: true } : {},
    orderBy: { nombre: "asc" }
  });
  return Response.json(empleados);
}

// Crear nuevo empleado
export async function POST(req: Request) {
  const body = await req.json();
  const { cedula, nombre, cargo, area, correo_electronico } = body;

  if (!cedula || !nombre || !cargo || !area || !correo_electronico) {
    return Response.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  // Verifica si ya existe un empleado con esa cédula
  const existente = await prisma.employee.findUnique({
    where: { cedula: parseInt(cedula) }
  });

  if (existente) {
    if (existente.activo) {
      // Ya existe y está activo — error
      return Response.json(
        { error: `Ya existe un empleado activo con la cédula ${cedula}` },
        { status: 400 }
      );
    } else {
      // Existe pero está inactivo — lo reactiva con los nuevos datos
      const reactivado = await prisma.employee.update({
        where: { cedula: parseInt(cedula) },
        data: { nombre, cargo, area, correo_electronico, activo: true }
      });
      return Response.json(reactivado, { status: 200 });
    }
  }

  // No existe — crea uno nuevo
  const empleado = await prisma.employee.create({
    data: { cedula: parseInt(cedula), nombre, cargo, area, correo_electronico }
  });

  return Response.json(empleado, { status: 201 });
}