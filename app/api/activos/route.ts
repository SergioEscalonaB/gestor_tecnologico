import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todos los activos, con filtro opcional por tipo y estado
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Filtros opcionales
  const tipo = searchParams.get("tipo"); // Esto se usa para filtrar por tipo de activo (ej. "laptop", "monitor")
  const estado = searchParams.get("estado");  // Esto se usa para filtrar por estado del activo (ej. "en uso", "en mantenimiento", "disponible")

  const activos = await prisma.asset.findMany({
    where: {
      ...(tipo   ? { tipo }   : {}),
      ...(estado ? { estado } : {}),
    },
    orderBy: { nombre: "asc" }
  });

  return Response.json(activos);
}

// Crear nuevo activo
export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, tipo, marca, modelo, numero_serie, estado, fecha_compra } = body;

  if (!nombre || !tipo || !marca || !modelo || !numero_serie || !estado || !fecha_compra) {
    return Response.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  const activo = await prisma.asset.create({
    data: {
      nombre, tipo, marca, modelo,
      numero_serie, estado,
      fecha_compra: new Date(fecha_compra) // convierte string a Date
    }
  });

  return Response.json(activo, { status: 201 });
}