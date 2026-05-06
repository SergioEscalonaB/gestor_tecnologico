import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Crear nuevo activo
export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, categoria, marca, modelo, numero_serie, estado, ubicacion, fecha_compra, valor_compra, proveedor, empleadoResponsableId } = body;

  if (!nombre || !categoria || !marca || !modelo || !numero_serie || !estado || !fecha_compra) {
    return Response.json(
      { error: "nombre, categoria, marca, modelo, numero_serie, estado y fecha_compra son obligatorios" },
      { status: 400 }
    );
  }

  const activo = await prisma.asset.create({
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
    }
  });
  return Response.json(activo, { status: 201 });
}