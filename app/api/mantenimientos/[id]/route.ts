import { prisma } from "@/lib/prisma";

// Obtener un mantenimiento por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber },
    include: { activo: true }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  return Response.json(mantenimiento);
}

// Finalizar mantenimiento — el activo vuelve a disponible
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);
  const body = await req.json();
  const { tipo, descripcion, fecha_programada, responsable, estado } = body;

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  // Actualiza el mantenimiento y sincroniza el estado del activo
  const [mantenimientoActualizado] = await prisma.$transaction([
    prisma.maintenance.update({
      where: { id: idNumber },
      data: {
        tipo: tipo,
        descripcion: descripcion,
        fecha_programada: new Date(fecha_programada),
        responsable: responsable,
        estado: estado,
        fecha_finalizacion: estado === "finalizado" ? new Date() : null
      }
    }),
    prisma.asset.update({
      where: { id: mantenimiento.activoId },
      data: { estado: estado === "finalizado" ? "disponible" : "mantenimiento" }
    })
  ]);

  return Response.json(mantenimientoActualizado);
}

// Eliminar mantenimiento
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id);

  const mantenimiento = await prisma.maintenance.findUnique({
    where: { id: idNumber }
  });

  if (!mantenimiento) {
    return Response.json({ error: "Mantenimiento no encontrado" }, { status: 404 });
  }

  await prisma.maintenance.delete({ where: { id: idNumber } });

  return Response.json({ mensaje: "Mantenimiento eliminado correctamente" });
}