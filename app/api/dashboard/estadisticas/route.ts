import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 1. Obteniendo todas las estadísticas del dashboard en paralelo
    const [
      totalActivos,
      enUso,
      mantenimiento,
      disponibles,
      totalUsuarios,
      totalAsignaciones,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { estado: "en_uso" } }),
      prisma.asset.count({ where: { estado: "mantenimiento" } }),
      prisma.asset.count({ where: { estado: "disponible" } }),
      prisma.employee.count({ where: { activo: true } }),
      prisma.assignment.count({ where: { fecha_fin: null } }),
    ]);

    // 2. Obteniendo todas las actividades recientes del dashboard
    const [recentAssignments, recentMaintenances] = await Promise.all([
      prisma.assignment.findMany({
        take: 5,
        orderBy: { fecha_inicio: "desc" },
        include: {
          activo: true,
          empleado: true,
        },
      }),
      prisma.maintenance.findMany({
        take: 5,
        orderBy: { fecha_programada: "desc" },
        include: {
          activo: true,
        },
      }),
    ]);

    // 3. Combinando todas las actividades recientes del dashboard
    const activities = [
      ...recentAssignments.map((asg) => ({
        type: "assignment",
        title: asg.fecha_fin ? "Equipo devuelto" : "Equipo asignado",
        detail: `${asg.activo?.nombre || "Activo"} asignado a ${asg.empleado?.nombre || "Empleado"}`,
        date: asg.fecha_inicio.toISOString(),
      })),
      ...recentMaintenances.map((maint) => ({
        type: "maintenance",
        title: maint.fecha_finalizacion
          ? "Mantenimiento completado"
          : "Mantenimiento programado",
        detail: `${maint.activo_nombre || maint.activo?.nombre || "Activo"} • ${maint.tipo}`,
        date: (
          maint.fecha_finalizacion || maint.fecha_programada
        ).toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Tomando solo las 4 actividades más recientes

    return Response.json({
      estadisticas: {
        totalActivos,
        enUso,
        mantenimiento,
        disponibles,
        totalUsuarios,
        totalAsignaciones,
      },
      recentActivity: activities,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return Response.json(
      { error: "Error al obtener estadísticas del dashboard" },
      { status: 500 },
    );
  }
}
