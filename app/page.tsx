"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Users,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const modulos = [
  {
    title: "Gestión de Activos",
    description:
      "Administra el inventario tecnológico, especificaciones y estados de cada activo.",
    href: "/activos",
    action: "Explorar activos",
    icon: <Package size={20} />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Mantenimientos",
    description:
      "Controla mantenimientos preventivos y correctivos con historial completo.",
    href: "/mantenimientos",
    action: "Ver mantenimientos",
    icon: <Wrench size={20} />,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Asignaciones",
    description:
      "Gestiona responsables, préstamos y devoluciones de equipos.",
    href: "/asignaciones",
    action: "Ver asignaciones",
    icon: <ClipboardCheck size={20} />,
    color: "bg-emerald-50 text-emerald-600",
  },
];

// Funcion para formatear el tiempo relativo
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs) || diffMs < 0) return "Recientemente";
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays}d`;
}


export default function Home() {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/estadisticas")
      .then((res) => res.json())
      .then((data) => {
        setEstadisticas(data.estadisticas);
        setActividadReciente(data.recentActivity);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos del dashboard:", err);
        setCargando(false);
      });
  }, []);

  // Estadisticas del dashboard
  const statItems = [
    {
      title: "Total Activos",
      value: cargando ? "..." : String(estadisticas?.totalActivos ?? 0),
      desc: "Equipos registrados",
      icon: <Package size={18} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "En Uso",
      value: cargando ? "..." : String(estadisticas?.enUso ?? 0),
      desc: "Asignados actualmente",
      icon: <Users size={18} />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Mantenimiento",
      value: cargando ? "..." : String(estadisticas?.mantenimiento ?? 0),
      desc: "Pendientes de revisión",
      icon: <Wrench size={18} />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Disponibles",
      value: cargando ? "..." : String(estadisticas?.disponibles ?? 0),
      desc: "Listos para asignar",
      icon: <CheckCircle2 size={18} />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Usuarios",
      value: cargando ? "..." : String(estadisticas?.totalUsuarios ?? 0),
      desc: "Usuarios registrados",
      icon: <Users size={18} />,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Asignaciones",
      value: cargando ? "..." : String(estadisticas?.totalAsignaciones ?? 0),
      desc: "Asignados actualmente",
      icon: <ClipboardCheck size={18} />,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Sistema operativo
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
              Gestión de Activos Tecnológicos
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
              Administra activos, mantenimientos y asignaciones desde un único
              panel centralizado.
            </p>
          </div>

          <div className="flex items-center gap-3 py-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              <BarChart3 size={18} />
              Dashboard
            </Link>

            <Link
              href="/activos"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors text-sm font-medium"
            >
              Inventario de Activos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Datos principales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
        {/* Cards */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-1 grid-cols-2 gap-4">
            {statItems.map((stat) => (
              <div
                key={stat.title}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{stat.desc}</span>
                  {/*
                  Para registrar porcentaje de cambios
                  <span className="text-xs font-semibold text-emerald-600">
                    {stat.change}
                  </span>
                  */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad */}
        <div className="md:row-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Actividad Reciente
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Últimos movimientos registrados.
              </p>
            </div>
            <TrendingUp size={18} className="text-blue-600 shrink-0" />
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {cargando ? (
              <div className="p-8 text-center text-sm text-gray-400">
                Cargando actividad...
              </div>
            ) : actividadReciente.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No hay actividad reciente
              </div>
            ) : (
              actividadReciente.map((activity, idx) => (
                <div
                  key={idx}
                  className="px-5 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                          activity.type === "maintenance"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {activity.type === "maintenance" ? (
                          <Wrench size={15} />
                        ) : (
                          <ClipboardCheck size={15} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(activity.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Seccion de Modulos principales */}
      <div className="grid grid-cols-1 grid-cols-1 gap-5">

        {/* Columna izquierda */}
        <div className="col-span-2 space-y-5">
          {/* Módulos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Módulos Principales
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Acceda rápidamente a las principales herramientas del sistema.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              {modulos.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group border border-gray-100 hover:border-blue-200 rounded-2xl p-4 hover:shadow-md transition-all bg-white"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center`}>
                    {module.icon}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mt-5">
                    <span>{module.action}</span>
                    <ArrowRight
                      size={15}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
}