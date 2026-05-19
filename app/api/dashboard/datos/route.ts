import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Estructura para filtrar por un rango de fechas opcional.
type DateRange = {
  gte?: Date;
  lte?: Date;
};

// Convierte los query params en un filtro usable por Prisma.
function buildDateRange(
  inicio: string | null,
  fin: string | null,
): DateRange | null {
  const range: DateRange = {};

  if (inicio) {
    const start = new Date(inicio);
    if (!Number.isNaN(start.getTime())) {
      range.gte = start;
    }
  }

  if (fin) {
    const end = new Date(fin);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
  }

  return Object.keys(range).length > 0 ? range : null;
}

// Verifica si una fecha pertenece al rango seleccionado.
function isInRange(dateValue: Date | string, range: DateRange | null) {
  if (!range) {
    return true;
  }

  const date = new Date(dateValue);

  if (range.gte && date < range.gte) {
    return false;
  }

  if (range.lte && date > range.lte) {
    return false;
  }

  return true;
}

// Convierte fechas a ISO para enviarlas al frontend.
function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

// Normaliza estados como "en uso" a formato con guion bajo.
function normalizeState(estado: string) {
  return estado.toLowerCase().replace(/\s+/g, "_");
}

export async function GET(req: Request) {
  try {
    // Lee filtros opcionales desde la URL.
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get("inicio");
    const fin = searchParams.get("fin");
    const dateRange = buildDateRange(inicio, fin);

    // Trae en paralelo los datos base que alimentan el dashboard.
    const [
      assets,
      totalUsuarios,
      totalAsignaciones,
      recentAssignments,
      upcomingMaintenances,
      recentMaintenances,
    ] = await Promise.all([
      prisma.asset.findMany({
        select: {
          id: true,
          nombre: true,
          categoria: true,
          marca: true,
          modelo: true,
          numero_serie: true,
          estado: true,
          ubicacion: true,
          fecha_compra: true,
          empleadoResponsable: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: { fecha_compra: "desc" },
      }),
      prisma.employee.count({ where: { activo: true } }),
      prisma.assignment.count({ where: { fecha_fin: null } }),
      prisma.assignment.findMany({
        where: dateRange ? { fecha_inicio: dateRange } : {},
        take: 5,
        orderBy: { fecha_inicio: "desc" },
        include: {
          activo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              marca: true,
              modelo: true,
              numero_serie: true,
              ubicacion: true,
              estado: true,
            },
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cedula: true,
              cargo: true,
              area: true,
              correo_electronico: true,
              activo: true,
            },
          },
        },
      }),
      prisma.maintenance.findMany({
        where: dateRange ? { fecha_programada: dateRange } : {},
        take: 5,
        orderBy: { fecha_programada: "asc" },
        include: {
          activo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              marca: true,
              modelo: true,
              numero_serie: true,
              ubicacion: true,
              estado: true,
            },
          },
        },
      }),
      prisma.maintenance.findMany({
        where: dateRange ? { fecha_programada: dateRange } : {},
        take: 5,
        orderBy: { fecha_programada: "desc" },
        include: {
          activo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              marca: true,
              modelo: true,
              numero_serie: true,
              ubicacion: true,
              estado: true,
            },
          },
        },
      }),
    ]);

    // Calcula el resumen principal de activos.
    const totalActivos = assets.length;

    const estadoCounts = assets.reduce<Record<string, number>>(
      (accumulator, asset) => {
        const estado = normalizeState(asset.estado);
        accumulator[estado] = (accumulator[estado] || 0) + 1;
        return accumulator;
      },
      {},
    );

    const enUso = estadoCounts.en_uso || 0;
    const mantenimiento = estadoCounts.mantenimiento || 0;
    const disponibles = estadoCounts.disponible || 0;

    // Agrupa activos por categoría para la visualización.
    const categoriaCounts = assets.reduce<Record<string, number>>(
      (accumulator, asset) => {
        const categoria = asset.categoria.trim() || "Sin categoría";
        accumulator[categoria] = (accumulator[categoria] || 0) + 1;
        return accumulator;
      },
      {},
    );

    const activosPorCategoria = Object.entries(categoriaCounts)
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje:
          totalActivos > 0 ? Math.round((cantidad / totalActivos) * 100) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);

    // Resume los estados para la segunda gráfica.
    const activosPorEstado = [
      { estado: "En uso", cantidad: enUso },
      { estado: "En mantenimiento", cantidad: mantenimiento },
      { estado: "Disponibles", cantidad: disponibles },
      { estado: "Dados de baja", cantidad: estadoCounts.dado_baja || 0 },
    ];

    // Normaliza la lista de activos más recientes para la tabla.
    const activosRecientes = assets
      .filter((asset) => isInRange(asset.fecha_compra, dateRange))
      .slice(0, 5)
      .map((asset) => ({
        id: asset.id,
        nombre: asset.nombre,
        categoria: asset.categoria,
        marca: asset.marca,
        modelo: asset.modelo,
        numero_serie: asset.numero_serie,
        estado: asset.estado,
        ubicacion: asset.ubicacion,
        fecha_compra: toIso(asset.fecha_compra),
        empleadoResponsable: asset.empleadoResponsable
          ? {
              id: asset.empleadoResponsable.id,
              nombre: asset.empleadoResponsable.nombre,
            }
          : null,
      }));

    // Normaliza los mantenimientos próximos para la tabla del dashboard.
    const mantenimientosProximos = upcomingMaintenances.map((maintenance) => ({
      id: maintenance.id,
      activoId: maintenance.activoId,
      activo_nombre: maintenance.activo_nombre,
      tipo: maintenance.tipo,
      descripcion: maintenance.descripcion,
      fecha_programada: toIso(maintenance.fecha_programada),
      responsable: maintenance.responsable,
      estado: maintenance.estado,
      fecha_finalizacion: maintenance.fecha_finalizacion
        ? toIso(maintenance.fecha_finalizacion)
        : null,
      activo: maintenance.activo
        ? {
            id: maintenance.activo.id,
            nombre: maintenance.activo.nombre,
            categoria: maintenance.activo.categoria,
            marca: maintenance.activo.marca,
            modelo: maintenance.activo.modelo,
            numero_serie: maintenance.activo.numero_serie,
            ubicacion: maintenance.activo.ubicacion,
            estado: maintenance.activo.estado,
          }
        : null,
    }));

    // Combina asignaciones y mantenimientos en una sola secuencia de actividad.
    const activities = [
      ...recentAssignments.map((assignment) => ({
        type: "assignment",
        title: assignment.fecha_fin ? "Equipo devuelto" : "Equipo asignado",
        detail: `${assignment.activo?.nombre || "Activo"} asignado a ${assignment.empleado?.nombre || "Empleado"}`,
        date: toIso(assignment.fecha_inicio),
      })),
      ...recentMaintenances.map((maintenance) => ({
        type: "maintenance",
        // Respuesta final consumida por la página del dashboard.
        title: maintenance.fecha_finalizacion
          ? "Mantenimiento completado"
          : "Mantenimiento programado",
        detail: `${maintenance.activo_nombre || maintenance.activo?.nombre || "Activo"} • ${maintenance.tipo}`,
        date: toIso(
          maintenance.fecha_finalizacion || maintenance.fecha_programada,
        ),
      })),
    ]
      .sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime(),
      )
      .slice(0, 6);

    return Response.json({
      estadisticas: {
        totalActivos,
        enUso,
        mantenimiento,
        disponibles,
        totalUsuarios,
        totalAsignaciones,
      },
      activosPorCategoria,
      activosPorEstado,
      mantenimientosProximos,
      activosRecientes,
      recentActivity: activities,
      filtros: {
        inicio: inicio || "",
        fin: fin || "",
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return Response.json(
      { error: "Error al obtener estadísticas del dashboard" },
      { status: 500 },
    );
  }
}
