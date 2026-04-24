import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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