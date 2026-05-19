import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type RangoFechas = {
  gte?: Date;
  lte?: Date;
};

function construirRangoFechas(
  inicio: string | null,
  fin: string | null,
): RangoFechas | null {
  const rango: RangoFechas = {};

  if (inicio) {
    const fechaInicio = new Date(inicio);
    if (!Number.isNaN(fechaInicio.getTime())) {
      rango.gte = fechaInicio;
    }
  }

  if (fin) {
    const fechaFin = new Date(fin);
    if (!Number.isNaN(fechaFin.getTime())) {
      fechaFin.setHours(23, 59, 59, 999);
      rango.lte = fechaFin;
    }
  }

  return Object.keys(rango).length > 0 ? rango : null;
}

function estaEnRango(fechaValor: Date | string, rango: RangoFechas | null) {
  if (!rango) {
    return true;
  }

  const fecha = new Date(fechaValor);

  if (rango.gte && fecha < rango.gte) {
    return false;
  }

  if (rango.lte && fecha > rango.lte) {
    return false;
  }

  return true;
}

function aIso(valor: Date | string) {
  return new Date(valor).toISOString();
}

function normalizarEstado(estado: string) {
  return estado.toLowerCase().replace(/\s+/g, "_");
}

export async function GET(req: Request) {
  try {
    // Lee filtros opcionales desde la URL.
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get("inicio");
    const fin = searchParams.get("fin");
    const rangoFechas = construirRangoFechas(inicio, fin);

    // Trae en paralelo los datos base que alimentan el dashboard.
    const [
      activos,
      totalUsuarios,
      totalAsignaciones,
      asignacionesRecientes,
      mantenimientosProximos,
      mantenimientosRecientes,
    ] = await Promise.all([
      prisma.asset.findMany({
        where: { estado: { not: "dado_baja" } },
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
        where: rangoFechas ? { fecha_inicio: rangoFechas } : {},
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
        where: rangoFechas ? { fecha_programada: rangoFechas } : {},
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
        where: rangoFechas ? { fecha_programada: rangoFechas } : {},
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
    const totalActivos = activos.length;

    const conteoEstados = activos.reduce<Record<string, number>>(
      (acumulador, activo) => {
        const estado = normalizarEstado(activo.estado);
        acumulador[estado] = (acumulador[estado] || 0) + 1;
        return acumulador;
      },
      {},
    );

    const enUso = conteoEstados.en_uso || 0;
    const mantenimiento = conteoEstados.mantenimiento || 0;
    const disponibles = conteoEstados.disponible || 0;

    // Agrupa activos por categoría para la visualización.
    const conteoCategorias = activos.reduce<Record<string, number>>(
      (acumulador, activo) => {
        const categoria = activo.categoria.trim() || "Sin categoría";
        acumulador[categoria] = (acumulador[categoria] || 0) + 1;
        return acumulador;
      },
      {},
    );

    const activosPorCategoria = Object.entries(conteoCategorias)
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
      { estado: "Dados de baja", cantidad: conteoEstados.dado_baja || 0 },
    ];

    // Normaliza la lista de activos más recientes para la tabla.
    const activosRecientes = activos
      .filter((activo) => estaEnRango(activo.fecha_compra, rangoFechas))
      .slice(0, 5)
      .map((activo) => ({
        id: activo.id,
        nombre: activo.nombre,
        categoria: activo.categoria,
        marca: activo.marca,
        modelo: activo.modelo,
        numero_serie: activo.numero_serie,
        estado: activo.estado,
        ubicacion: activo.ubicacion,
        fecha_compra: aIso(activo.fecha_compra),
        empleadoResponsable: activo.empleadoResponsable
          ? {
              id: activo.empleadoResponsable.id,
              nombre: activo.empleadoResponsable.nombre,
            }
          : null,
      }));

    // Normaliza los mantenimientos próximos para la tabla del dashboard.
    const mantenimientosProximosNormalizados = mantenimientosProximos.map(
      (mantenimiento) => ({
        id: mantenimiento.id,
        activoId: mantenimiento.activoId,
        activo_nombre: mantenimiento.activo_nombre,
        tipo: mantenimiento.tipo,
        descripcion: mantenimiento.descripcion,
        fecha_programada: aIso(mantenimiento.fecha_programada),
        responsable: mantenimiento.responsable,
        estado: mantenimiento.estado,
        fecha_finalizacion: mantenimiento.fecha_finalizacion
          ? aIso(mantenimiento.fecha_finalizacion)
          : null,
        activo: mantenimiento.activo
          ? {
              id: mantenimiento.activo.id,
              nombre: mantenimiento.activo.nombre,
              categoria: mantenimiento.activo.categoria,
              marca: mantenimiento.activo.marca,
              modelo: mantenimiento.activo.modelo,
              numero_serie: mantenimiento.activo.numero_serie,
              ubicacion: mantenimiento.activo.ubicacion,
              estado: mantenimiento.activo.estado,
            }
          : null,
      }),
    );

    // Combina asignaciones y mantenimientos en una sola secuencia de actividad.
    const actividadReciente = [
      ...asignacionesRecientes.map((asignacion) => ({
        tipo: "asignacion",
        title: asignacion.fecha_fin ? "Equipo devuelto" : "Equipo asignado",
        detail: `${asignacion.activo?.nombre || "Activo"} asignado a ${asignacion.empleado?.nombre || "Empleado"}`,
        date: aIso(asignacion.fecha_inicio),
      })),
      ...mantenimientosRecientes.map((mantenimiento) => ({
        tipo: "mantenimiento",
        title: mantenimiento.fecha_finalizacion
          ? "Mantenimiento completado"
          : "Mantenimiento programado",
        detail: `${mantenimiento.activo_nombre || mantenimiento.activo?.nombre || "Activo"} • ${mantenimiento.tipo}`,
        date: aIso(
          mantenimiento.fecha_finalizacion || mantenimiento.fecha_programada,
        ),
      })),
    ]
      .sort(
        (izquierda, derecha) =>
          new Date(derecha.date).getTime() - new Date(izquierda.date).getTime(),
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
      mantenimientosProximos: mantenimientosProximosNormalizados,
      activosRecientes,
      actividadReciente,
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
