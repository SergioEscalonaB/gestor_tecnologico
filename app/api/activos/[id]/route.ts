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
      empleadoResponsable: true, // información del empleado responsable
      mantenimientos: { orderBy: { fecha_programada: "desc" } }, // historial de mantenimientos
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
  const { nombre, categoria, marca, modelo, numero_serie,
    estado, ubicacion, fecha_compra, valor_compra,
    proveedor, empleadoResponsableId } = body;

  // Realizamos la actualización en una transacción para mantener la coherencia con el historial de asignaciones
  const activo = await prisma.$transaction(async (tx) => {
    // 1. Obtener el estado actual del activo antes de actualizar
    const oldActivo = await tx.asset.findUnique({
      where: { id: idNumber },
      select: { empleadoResponsableId: true }
    });

    // 2. Actualizar el activo
    const updated = await tx.asset.update({
      where: { id: idNumber },
      data: {
        nombre, categoria, marca, modelo,
        numero_serie, estado, 
        ubicacion : ubicacion ?? null,
        fecha_compra: new Date(fecha_compra),
        valor_compra : valor_compra ?? null,
        proveedor : proveedor ?? null,
        empleadoResponsableId: empleadoResponsableId ?? null
      },
      include: {
        empleadoResponsable: true
      }
    });

    // 3. Si el responsable ha cambiado, gestionar el historial de asignaciones
    if (oldActivo?.empleadoResponsableId !== empleadoResponsableId) {
      // Cerrar la asignación anterior si existía
      if (oldActivo?.empleadoResponsableId) {
        await tx.assignment.updateMany({
          where: { 
            activoId: idNumber, 
            empleadoId: oldActivo.empleadoResponsableId, 
            fecha_fin: null 
          },
          data: { fecha_fin: new Date() }
        });
      }

      // Crear la nueva asignación si hay un nuevo responsable
      if (empleadoResponsableId) {
        await tx.assignment.create({
          data: { 
            activoId: idNumber, 
            empleadoId: empleadoResponsableId,
            fecha_inicio: new Date()
          }
        });
      }
    }

    return updated;
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