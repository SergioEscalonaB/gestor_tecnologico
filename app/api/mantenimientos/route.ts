import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todos los mantenimientos con el activo completo
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activoId = searchParams.get("activoId");
  const tipo = searchParams.get("tipo"); // preventivo, correctivo, revision_general, revision_de_software
  const estado = searchParams.get("estado"); // pendiente, en_proceso, programado, pendiente_de_respuesta, vencido

  const mantenimientos = await prisma.maintenance.findMany({
    where: {
      ...(activoId ? { activoId: parseInt(activoId) } : {}),
      ...(tipo      ? { tipo }                            : {}),
      ...(estado    ? { estado }                          : {})
    },
    include: { activo: true },
    orderBy: { fecha_programada: "desc" }
  });

  return Response.json(mantenimientos);
}

// Registrar nuevo mantenimiento
export async function POST(req: Request) {
  const body = await req.json();
  const { activoId, tipo, descripcion, fecha_programada, responsable, estado } = body;

  if (!activoId || !tipo || !descripcion || !fecha_programada || !responsable || !estado) {
    return Response.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  // Verificar que el activo exista
  const activo = await prisma.asset.findUnique({
    where: { id: activoId }
  });

  if (!activo) {
    return Response.json({ error: "Activo no encontrado" }, { status: 404 });
  }

  // Registrar mantenimiento y cambiar estado del activo
  const [mantenimiento] = await prisma.$transaction([
    prisma.maintenance.create({
      data: { activoId, tipo, descripcion, fecha_programada, responsable, estado, activo_nombre: activo.nombre }
    }),
    prisma.asset.update({
      where: { id: activoId },
      data: { estado: "mantenimiento" } // El activo pasa a mantenimiento
    })
  ]);

  return Response.json(mantenimiento, { status: 201 });
}