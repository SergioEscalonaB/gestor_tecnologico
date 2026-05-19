import { prisma } from "@/lib/prisma";

// Crear nuevo activo
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, categoria, marca, modelo, numero_serie, estado, ubicacion, fecha_compra, valor_compra, proveedor, empleadoResponsableId } = body;

  if (!nombre || !categoria || !marca || !modelo || !numero_serie || !estado || !fecha_compra) {
    return Response.json(
      { error: "nombre, categoria, marca, modelo, numero_serie, estado y fecha_compra son obligatorios" },
      { status: 400 }
    );
  }

    // Usamos una transacción para asegurar que si hay un responsable, se cree la asignación
    const activo = await prisma.$transaction(async (tx) => {
      const nuevoActivo = await tx.asset.create({
        data: {
          nombre, 
          categoria, 
          marca, 
          modelo,
          numero_serie, 
          estado, 
          ubicacion : ubicacion ?? null, 
          fecha_compra: new Date(fecha_compra),
          valor_compra : valor_compra ?? null, 
          proveedor : proveedor ?? null, 
          empleadoResponsableId : empleadoResponsableId ?? null
        },
        // Para que traiga al empleado responsable
        include: {
          empleadoResponsable: true
        }
      });

      // Si se asignó un responsable de inmediato, creamos el registro de asignación
      if (empleadoResponsableId) {
        await tx.assignment.create({
          data: {
            activoId: nuevoActivo.id,
            empleadoId: empleadoResponsableId,
            fecha_inicio: new Date()
          }
        });
      }

      return nuevoActivo;
    });

    return Response.json(activo, { status: 201 });

  } catch (error) {
    console.error("Error al crear activo:", error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}