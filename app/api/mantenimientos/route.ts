import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todos los mantenimientos con el activo completo
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activo_id = searchParams.get("activo_id");
  const tipo = searchParams.get("tipo"); // preventivo o correctivo

  const mantenimientos = await prisma.maintenance.findMany({
    where: {
      ...(activo_id ? { activo_id: parseInt(activo_id) } : {}),
      ...(tipo      ? { tipo }                            : {}),
    },
    include: { activo: true },
    orderBy: { fecha: "desc" }
  });

  return Response.json(mantenimientos);
}

// Registrar nuevo mantenimiento
export async function POST(req: Request) {
  const body = await req.json();
  const { activo_id, tipo, descripcion, tecnico } = body;

  if (!activo_id || !tipo || !descripcion || !tecnico) {
    return Response.json(
      { error: "activo_id, tipo, descripcion y tecnico son obligatorios" },
      { status: 400 }
    );
  }

  // Verificar que el activo exista
  const activo = await prisma.asset.findUnique({
    where: { id: activo_id }
  });

  if (!activo) {
    return Response.json({ error: "Activo no encontrado" }, { status: 404 });
  }

  // Registrar mantenimiento y cambiar estado del activo
  const [mantenimiento] = await prisma.$transaction([
    prisma.maintenance.create({
      data: { activo_id, tipo, descripcion, tecnico }
    }),
    prisma.asset.update({
      where: { id: activo_id },
      data: { estado: "mantenimiento" } // El activo pasa a mantenimiento
    })
  ]);

  return Response.json(mantenimiento, { status: 201 });
}