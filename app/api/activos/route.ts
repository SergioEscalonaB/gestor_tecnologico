import { prisma } from "@/lib/prisma";

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
    // Para que traiga al empleado responsable
    include: {
      empleadoResponsable: true
    },
    orderBy: { nombre: "asc" }
  });

  return Response.json(activos);
}