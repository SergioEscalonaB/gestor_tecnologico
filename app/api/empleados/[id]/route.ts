import { prisma } from "@/lib/prisma";

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

//  Actualizar estado de un empleado (activar/desactivar)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  try {
    const body = await req.json();
    const { activo } = body;
    
    // Si no se envía activo, por defecto es false (desactivar)
    const nuevoEstado = activo !== undefined ? Boolean(activo) : false;

    // Usamos una transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el empleado
      const empleado = await tx.employee.update({
        where: { id: idNumber },
        data: { activo: nuevoEstado }
      });

      // 2. Si se está desactivando, liberar sus activos y cerrar asignaciones
      if (!nuevoEstado) {
        // Liberar activos en uso por este empleado
        await tx.asset.updateMany({
          where: { empleadoResponsableId: idNumber },
          data: {
            estado: "disponible",
            empleadoResponsableId: null
          }
        });

        // Cerrar asignaciones abiertas
        await tx.assignment.updateMany({
          where: { 
            empleadoId: idNumber,
            fecha_fin: null
          },
          data: {
            fecha_fin: new Date()
          }
        });
      }

      return empleado;
    });

    return Response.json(resultado);
  } catch (error: any) {
    console.error("Error en PATCH empleado:", error);
    return Response.json(
      { error: "No se pudo actualizar el estado del empleado" },
      { status: 500 }
    );
  }
}
