import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Configuración de Prisma con PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todas las asignaciones con empleado y activo completos
export async function GET() {
  const asignaciones = await prisma.assignment.findMany({
    include: {
      activo: true,
      empleado: true
    },
    orderBy: { fecha_inicio: "desc" }
  });

  return Response.json(asignaciones);
}

// Crear nueva asignación
export async function POST(req: Request) {
  const body = await req.json();
  const { activo_id, empleado_id } = body;

  if (!activo_id || !empleado_id) {
    return Response.json(
      { error: "activo_id y empleado_id son obligatorios" },
      { status: 400 }
    );
  }

  // Verificar que el activo esté disponible
  const activo = await prisma.asset.findUnique({
    where: { id: activo_id }
  });

  if (!activo) {
    return Response.json({ error: "Activo no encontrado" }, { status: 404 });
  }

  if (activo.estado !== "disponible") {
    return Response.json(
      { error: `El activo no está disponible, estado actual: ${activo.estado}` },
      { status: 400 }
    );
  }

  // Crear la asignación y cambiar estado del activo a "en_uso"
  const [asignacion] = await prisma.$transaction([
    prisma.assignment.create({
      data: { activo_id, empleado_id }
    }),
    prisma.asset.update({
      where: { id: activo_id },
      data: { estado: "en_uso" }
    })
  ]);

  return Response.json(asignacion, { status: 201 });
}