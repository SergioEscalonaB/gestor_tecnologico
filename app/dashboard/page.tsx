"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Package,
  RotateCcw,
  Users,
  Wrench,
} from "lucide-react";
import { GraficasDelPanel } from "../../components/dashboard/DashboardCharts";
import { MantenimientosProximosPanel } from "../../components/dashboard/ProximosMantenimientos";
import { ActivosRecientesPanel } from "../../components/dashboard/ActivosRecientes";

// Resumen general para las tarjetas principales.
type ResumenEstadisticas = {
  totalActivos: number;
  enUso: number;
  mantenimiento: number;
  disponibles: number;
  totalUsuarios: number;
  totalAsignaciones: number;
};

type ResumenCategoria = {
  categoria: string;
  cantidad: number;
  porcentaje: number;
};

type ResumenEstado = {
  estado: string;
  cantidad: number;
};

type ResponsableActivo = {
  id: number;
  nombre: string;
} | null;

type ResumenActivo = {
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

type ResumenMantenimiento = {
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

type ItemActividad = {
  type: "assignment" | "maintenance";
  title: string;
  detail: string;
  date: string;
};

type RespuestaPanelDashboard = {
  estadisticas: ResumenEstadisticas;
  activosPorCategoria: ResumenCategoria[];
  activosPorEstado: ResumenEstado[];
  mantenimientosProximos: ResumenMantenimiento[];
  activosRecientes: ResumenActivo[];
  recentActivity: ItemActividad[];
  filtros: {
    inicio: string;
    fin: string;
  };
};

// Estado base para evitar tarjetas vacías.
const estadisticasVacias: ResumenEstadisticas = {
  totalActivos: 0,
  enUso: 0,
  mantenimiento: 0,
  disponibles: 0,
  totalUsuarios: 0,
  totalAsignaciones: 0,
};

// Formatea fechas para tablas y listados.
function formatearFecha(valor: string) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

// Convierte una fecha en un texto relativo como "Hace 2h".
function formatearTiempoRelativo(valor: string) {
  const fecha = new Date(valor);
  const diferenciaMs = Date.now() - fecha.getTime();

  if (Number.isNaN(diferenciaMs) || diferenciaMs < 0) {
    return "Recientemente";
  }

  const minutos = Math.floor(diferenciaMs / 60000);
  if (minutos < 1) {
    return "Ahora mismo";
  }
  if (minutos < 60) {
    return `Hace ${minutos}m`;
  }

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `Hace ${horas}h`;
  }

  const dias = Math.floor(horas / 24);
  if (dias === 1) {
    return "Ayer";
  }

  return `Hace ${dias}d`;
}

// Normaliza estados para usarlos como claves internas.
function normalizarEstado(estado: string) {
  return estado.toLowerCase().replace(/\s+/g, "_");
}

// Traduce el estado técnico a una etiqueta legible.
function etiquetaEstado(estado: string) {
  const normalizado = normalizarEstado(estado);

  if (normalizado === "en_uso") {
    return "En uso";
  }
  if (normalizado === "mantenimiento") {
    return "En mantenimiento";
  }
  if (normalizado === "disponible") {
    return "Disponible";
  }
  if (normalizado === "dado_baja") {
    return "Dado de baja";
  }

  return estado;
}

// Clases visuales para el estado de un activo.
function clasesEtiquetaEstado(estado: string) {
  const normalizado = normalizarEstado(estado);

  if (normalizado === "en_uso") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (normalizado === "mantenimiento") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (normalizado === "disponible") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (normalizado === "dado_baja") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-gray-50 text-gray-700 border-gray-100";
}

// Clases visuales para el estado de un mantenimiento.
function clasesEtiquetaMantenimiento(estado: string) {
  const normalizado = normalizarEstado(estado);

  if (normalizado === "programado") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (normalizado === "pendiente") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (normalizado === "en_proceso") {
    return "bg-violet-50 text-violet-700 border-violet-100";
  }
  if (normalizado === "pendiente_de_respuesta") {
    return "bg-orange-50 text-orange-700 border-orange-100";
  }
  if (normalizado === "vencido") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-gray-50 text-gray-700 border-gray-100";
}

export default function Dashboard() {
  const [datos, setDatos] = useState<RespuestaPanelDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Carga los datos reales del dashboard cada vez que cambian los filtros.
  useEffect(() => {
    const controlador = new AbortController();

    const cargarDatos = async () => {
      setCargando(true);

      try {
        const parametros = new URLSearchParams();

        if (fechaInicio) {
          parametros.set("inicio", fechaInicio);
        }

        if (fechaFin) {
          parametros.set("fin", fechaFin);
        }

        const respuesta = await fetch(
          `/api/dashboard/datos${parametros.toString() ? `?${parametros.toString()}` : ""}`,
          { signal: controlador.signal },
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los datos del dashboard");
        }

        const payload = (await respuesta.json()) as RespuestaPanelDashboard;
        setDatos(payload);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error al cargar datos del dashboard:", error);
          setDatos(null);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => controlador.abort();
  }, [fechaInicio, fechaFin]);

  const estadisticas = datos?.estadisticas ?? estadisticasVacias;
  const activosPorCategoria = datos?.activosPorCategoria ?? [];
  const activosPorEstado = datos?.activosPorEstado ?? [];
  const mantenimientosProximos = datos?.mantenimientosProximos ?? [];
  const activosRecientes = datos?.activosRecientes ?? [];
  const actividadReciente = datos?.recentActivity ?? [];

  const maximoEstado = Math.max(
    ...activosPorEstado.map((item) => item.cantidad),
    1,
  );
  const totalActivos = estadisticas.totalActivos;
  const totalPastel = Math.max(
    activosPorCategoria.reduce((suma, item) => suma + item.cantidad, 0),
    1,
  );
  const coloresPastel = [
    "#2563eb",
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#64748b",
  ];
  const coloresEstados = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6"];
  const actualizandoDatos = cargando && Boolean(datos);

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
      {actualizandoDatos ? (
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
      <GraficasDelPanel
        resumenCategorias={activosPorCategoria}
        resumenEstados={activosPorEstado}
        totalActivos={totalActivos}
        maximoEstado={maximoEstado}
        totalPastel={totalPastel}
        coloresPastel={coloresPastel}
        coloresEstados={coloresEstados}
      />

      {/* Tablas principales del dashboard */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MantenimientosProximosPanel
          mantenimientosProximos={mantenimientosProximos}
          cargandoDatos={cargando && !datos}
          formatearFecha={formatearFecha}
          clasesEtiquetaMantenimiento={clasesEtiquetaMantenimiento}
          etiquetaEstado={etiquetaEstado}
        />

        <ActivosRecientesPanel
          activosRecientes={activosRecientes}
          cargandoDatos={cargando && !datos}
          formatearFecha={formatearFecha}
          clasesEtiquetaEstado={clasesEtiquetaEstado}
          etiquetaEstado={etiquetaEstado}
        />
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
          ) : actividadReciente.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-400">
              No hay actividad reciente.
            </div>
          ) : (
            actividadReciente.map((actividad, index) => (
              <div
                key={`${actividad.type}-${index}`}
                className="px-5 py-4 transition-colors hover:bg-gray-50/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${actividad.type === "maintenance" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                    >
                      {actividad.type === "maintenance" ? (
                        <Wrench size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {actividad.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {actividad.detail}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {formatearTiempoRelativo(actividad.date)}
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
