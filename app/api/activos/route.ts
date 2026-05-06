import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todos los activos, con filtro opcional por categoria y estado
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Filtros opcionales
  const categoria = searchParams.get("categoria"); // Esto se usa para filtrar por categoria de activo (ej. "laptop", "monitor")
  const estado = searchParams.get("estado");  // Esto se usa para filtrar por estado del activo (ej. "en uso", "en mantenimiento", "disponible")

  const activos = await prisma.asset.findMany({
    where: {
      ...(categoria   ? { categoria }   : {}),
      ...(estado ? { estado } : {}),
    },
    orderBy: { nombre: "asc" }
  });

  return Response.json(activos);
}