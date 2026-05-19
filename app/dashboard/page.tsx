"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Package,
  RotateCcw,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

type DashboardStats = {
  totalActivos: number;
  enUso: number;
  mantenimiento: number;
  disponibles: number;
  totalUsuarios: number;
  totalAsignaciones: number;
};

type CategoriaResumen = {
  categoria: string;
  cantidad: number;
  porcentaje: number;
};

type EstadoResumen = {
  estado: string;
  cantidad: number;
};

type ResponsableActivo = {
  id: number;
  nombre: string;
} | null;

type ActivoResumen = {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  ubicacion: string | null;
  fecha_compra: string;
  empleadoResponsable: ResponsableActivo;
};

type MantenimientoResumen = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: string;
  responsable: string;
  estado: string;
  fecha_finalizacion: string | null;
  activo: {
    id: number;
    nombre: string;
    categoria: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    ubicacion: string | null;
    estado: string;
  } | null;
};

type ActivityItem = {
  type: "assignment" | "maintenance";
  title: string;
  detail: string;
  date: string;
};

type DashboardResponse = {
  estadisticas: DashboardStats;
  activosPorCategoria: CategoriaResumen[];
  activosPorEstado: EstadoResumen[];
  mantenimientosProximos: MantenimientoResumen[];
  activosRecientes: ActivoResumen[];
  recentActivity: ActivityItem[];
  filtros: {
    inicio: string;
    fin: string;
  };
};

// Obteniendo las estadísticas principales del dashboard
const emptyStats: DashboardStats = {
  totalActivos: 0,
  enUso: 0,
  mantenimiento: 0,
  disponibles: 0,
  totalUsuarios: 0,
  totalAsignaciones: 0,
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Función principal del componente del dashboard
function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "Recientemente";
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return "Ahora mismo";
  }
  if (minutes < 60) {
    return `Hace ${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hace ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "Ayer";
  }

  return `Hace ${days}d`;
}

// Función para normalizar estados y generar etiquetas legibles.
function normalizeState(estado: string) {
  return estado.toLowerCase().replace(/\s+/g, "_");
}

function stateLabel(estado: string) {
  const normalized = normalizeState(estado);

  if (normalized === "en_uso") {
    return "En uso";
  }
  if (normalized === "mantenimiento") {
    return "En mantenimiento";
  }
  if (normalized === "disponible") {
    return "Disponible";
  }
  if (normalized === "dado_baja") {
    return "Dado de baja";
  }

  return estado;
}

// Funciones para asignar clases de estilo según el estado del activo o mantenimiento.
function stateBadgeClasses(estado: string) {
  const normalized = normalizeState(estado);

  if (normalized === "en_uso") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (normalized === "mantenimiento") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (normalized === "disponible") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (normalized === "dado_baja") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-gray-50 text-gray-700 border-gray-100";
}

// Clases específicas para los estados de mantenimiento, que pueden ser más variados.
function maintenanceBadgeClasses(estado: string) {
  const normalized = normalizeState(estado);

  if (normalized === "programado") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (normalized === "pendiente") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (normalized === "en_proceso") {
    return "bg-violet-50 text-violet-700 border-violet-100";
  }
  if (normalized === "pendiente_de_respuesta") {
    return "bg-orange-50 text-orange-700 border-orange-100";
  }
  if (normalized === "vencido") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-gray-50 text-gray-700 border-gray-100";
}

export default function Dashboard() {
  const [datos, setDatos] = useState<DashboardResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Carga los datos reales del dashboard cada vez que cambian los filtros.
  useEffect(() => {
    const controller = new AbortController();

    const cargarDatos = async () => {
      setCargando(true);

      try {
        const params = new URLSearchParams();

        if (fechaInicio) {
          params.set("inicio", fechaInicio);
        }

        if (fechaFin) {
          params.set("fin", fechaFin);
        }

        const response = await fetch(
          `/api/dashboard/datos${params.toString() ? `?${params.toString()}` : ""}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos del dashboard");
        }

        const payload = (await response.json()) as DashboardResponse;
        setDatos(payload);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error al cargar datos del dashboard:", error);
          setDatos(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => controller.abort();
  }, [fechaInicio, fechaFin]);

  const estadisticas = datos?.estadisticas ?? emptyStats;
  const activosPorCategoria = datos?.activosPorCategoria ?? [];
  const activosPorEstado = datos?.activosPorEstado ?? [];
  const mantenimientosProximos = datos?.mantenimientosProximos ?? [];
  const activosRecientes = datos?.activosRecientes ?? [];
  const recentActivity = datos?.recentActivity ?? [];

  const maxCategoria = Math.max(
    ...activosPorCategoria.map((item) => item.cantidad),
    1,
  );
  const maxEstado = Math.max(
    ...activosPorEstado.map((item) => item.cantidad),
    1,
  );
  const actualizando = cargando && Boolean(datos);

  return (
    <div className="space-y-6">
      {/* Encabezado y filtros del dashboard */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Resumen general de activos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Datos sincronizados desde la base de datos para activos,
            mantenimientos y asignaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm">
          <label
            htmlFor="fecha-inicio"
            className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Inicio
            <input
              type="date"
              id="fecha-inicio"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              className="w-40 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label
            htmlFor="fecha-fin"
            className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Fin
            <input
              type="date"
              id="fecha-fin"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(event) => setFechaFin(event.target.value)}
              className="w-40 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Estado visual mientras se refrescan los datos */}
      {actualizando ? (
        <div className="text-xs font-medium text-blue-600">
          Actualizando datos...
        </div>
      ) : null}

      {/* Tarjetas principales de resumen */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total activos",
            value: cargando && !datos ? "..." : estadisticas.totalActivos,
            desc: "Inventario total registrado",
            icon: <Package size={18} />,
            color: "bg-gray-100 text-gray-700",
          },
          {
            title: "En uso",
            value: cargando && !datos ? "..." : estadisticas.enUso,
            desc: "Asignados actualmente",
            icon: <Users size={18} />,
            color: "bg-blue-50 text-blue-700",
          },
          {
            title: "En mantenimiento",
            value: cargando && !datos ? "..." : estadisticas.mantenimiento,
            desc: "Con revisión pendiente",
            icon: <Wrench size={18} />,
            color: "bg-amber-50 text-amber-700",
          },
          {
            title: "Disponibles",
            value: cargando && !datos ? "..." : estadisticas.disponibles,
            desc: "Listos para asignar",
            icon: <CheckCircle2 size={18} />,
            color: "bg-emerald-50 text-emerald-700",
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gray-50" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {stat.title}
                </p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500">{stat.desc}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Gráficas resumidas por categoría y estado */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Activos por categoría
              </h3>
              <p className="text-sm text-gray-500">
                Distribución tomada desde Prisma.
              </p>
            </div>
            <BarChart3 size={18} className="text-blue-600" />
          </div>

          {activosPorCategoria.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
              No hay datos de categorías para mostrar.
            </div>
          ) : (
            <div className="space-y-4">
              {activosPorCategoria.map((item) => (
                <div key={item.categoria}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.categoria}
                    </span>
                    <span className="text-gray-500">
                      {item.cantidad} · {item.porcentaje}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.max((item.cantidad / maxCategoria) * 100, item.cantidad > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Activos por estado
              </h3>
              <p className="text-sm text-gray-500">
                Conteo de estados actuales del inventario.
              </p>
            </div>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>

          {activosPorEstado.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
              No hay estados disponibles.
            </div>
          ) : (
            <div className="space-y-4">
              {activosPorEstado.map((item) => (
                <div key={item.estado}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.estado}
                    </span>
                    <span className="text-gray-500">{item.cantidad}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.max((item.cantidad / maxEstado) * 100, item.cantidad > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tablas principales del dashboard */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Próximos mantenimientos
              </h3>
              <p className="text-sm text-gray-500">
                Registros ordenados por fecha programada.
              </p>
            </div>
            <Clock3 size={18} className="text-amber-600" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Equipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Responsable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cargando && !datos ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                      Cargando mantenimientos...
                    </td>
                  </tr>
                ) : mantenimientosProximos.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                      No hay mantenimientos para mostrar.
                    </td>
                  </tr>
                ) : (
                  mantenimientosProximos.map((mantenimiento) => (
                    <tr key={mantenimiento.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {mantenimiento.activo?.nombre ||
                            mantenimiento.activo_nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mantenimiento.activo?.marca || ""}{" "}
                          {mantenimiento.activo?.modelo
                            ? `· ${mantenimiento.activo.modelo}`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {mantenimiento.tipo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(mantenimiento.fecha_programada)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {mantenimiento.responsable}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${maintenanceBadgeClasses(mantenimiento.estado)}`}
                        >
                          {stateLabel(mantenimiento.estado)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Activos más recientes
              </h3>
              <p className="text-sm text-gray-500">
                Altas más recientes registradas en el sistema.
              </p>
            </div>
            <CalendarDays size={18} className="text-blue-600" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Activo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Compra
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cargando && !datos ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>
                      Cargando activos...
                    </td>
                  </tr>
                ) : activosRecientes.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>
                      No hay activos recientes para mostrar.
                    </td>
                  </tr>
                ) : (
                  activosRecientes.map((activo) => (
                    <tr key={activo.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {activo.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activo.categoria}
                          {activo.empleadoResponsable
                            ? ` · ${activo.empleadoResponsable.nombre}`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${stateBadgeClasses(activo.estado)}`}
                        >
                          {stateLabel(activo.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(activo.fecha_compra)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Actividad reciente combinada */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad reciente
            </h3>
            <p className="text-sm text-gray-500">
              Movimientos combinados de asignaciones y mantenimientos.
            </p>
          </div>
          <Activity size={18} className="text-violet-600" />
        </div>

        <div className="divide-y divide-gray-100">
          {cargando && !datos ? (
            <div className="px-5 py-8 text-sm text-gray-400">
              Cargando actividad...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-400">
              No hay actividad reciente.
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={`${activity.type}-${index}`}
                className="px-5 py-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${activity.type === "maintenance" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                    >
                      {activity.type === "maintenance" ? (
                        <Wrench size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {activity.detail}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
