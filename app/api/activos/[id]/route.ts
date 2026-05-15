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
    // 1. Obtener el responsable actual
    const oldActivo = await tx.asset.findUnique({
      where: { id: idNumber },
      select: { empleadoResponsableId: true }
    });

    // 2. Si el responsable ha cambiado, gestionar el historial de asignaciones
    if (oldActivo?.empleadoResponsableId !== empleadoResponsableId) {
      // Cerramos CUALQUIER asignación activa de este activo para evitar duplicados
      await tx.assignment.updateMany({
        where: { 
          activoId: idNumber, 
          fecha_fin: null 
        },
        data: { fecha_fin: new Date() }
      });

      // Creamos la nueva asignación si hay un nuevo responsable
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

    // 3. Actualizar el activo con el nuevo estado y responsable
    // Si hay responsable -> en_uso. Si no hay -> disponible (a menos que sea mantenimiento/baja)
    let nuevoEstado = estado;
    if (estado === "disponible" || estado === "en_uso") {
        nuevoEstado = empleadoResponsableId ? "en_uso" : "disponible";
    }

    return await tx.asset.update({
      where: { id: idNumber },
      data: {
        nombre, categoria, marca, modelo,
        numero_serie, 
        estado: nuevoEstado, 
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