"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Package,
  Users,
  Wrench,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Building2,
} from "lucide-react";

const modules = [
  {
    title: "Gestión de Activos",
    description:
      "Control completo de tu inventario tecnológico. Registra, categoriza y monitorea cada equipo con especificaciones detalladas.",
    href: "/activos",
    action: "Explorar Activos",
    icon: <Package size={28} />,
    bgColor: "bg-blue-600",
    accentColor: "text-blue-600",
    lightBg: "bg-blue-50",
  },
  {
    title: "Mantenimientos",
    description:
      "Programa y registra mantenimientos preventivos y correctivos. Controla fechas, responsables y estados de cada intervención.",
    href: "/mantenimientos",
    action: "Ver Mantenimientos",
    icon: <Wrench size={28} />,
    bgColor: "bg-orange-500",
    accentColor: "text-orange-500",
    lightBg: "bg-orange-50",
  },
  {
    title: "Asignaciones",
    description:
      "Rastrea quién tiene qué equipo y cuándo. Historial completo de movimientos con fechas de inicio y devolución.",
    href: "/asignaciones",
    action: "Ver Asignaciones",
    icon: <ClipboardCheck size={28} />,
    bgColor: "bg-purple-600",
    accentColor: "text-purple-600",
    lightBg: "bg-purple-50",
  },
];

const stats = [
  {
    title: "Total Activos",
    value: "248",
    change: "+12%",
    desc: "registrados en sistema",
    icon: <Package size={20} />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "En Uso",
    value: "156",
    change: "+8%",
    desc: "asignados a usuarios",
    icon: <Users size={20} />,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "En Mantenimiento",
    value: "12",
    change: "-3%",
    desc: "pendientes de atención",
    icon: <Wrench size={20} />,
    color: "bg-orange-50 text-orange-500",
  },
  {
    title: "Disponibles",
    value: "78",
    change: "+5%",
    desc: "listos para asignar",
    icon: <CheckCircle2 size={20} />,
    color: "bg-emerald-50 text-emerald-600",
  },
];

const recentActivity = [
  { type: "maintenance", text: "Mantenimiento completado", detail: "MacBook Pro SN-2024-001", time: "hace 2h" },
  { type: "assignment", text: "Equipo asignado", detail: "iPhone 15 Pro a Juan Pérez", time: "hace 4h" },
  { type: "alert", text: "Asignación próxima a vencer", detail: "iPad de Ana Martinez vence en 3 días", time: "hace 1d" },
];

export default function Home() {
  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-400 to-emerald-400 px-6 py-12 md:py-16 text-black shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30">
            <Zap size={16} />
            <span className="text-sm font-bold">Sistema Activo y Operativo</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Gestión Inteligente <br />
              de Activos Tecnológicos
            </h1>
            <p className="text-lg text-black max-w-2xl leading-relaxed">
              Centraliza el control de tu inventario, mantenimientos y asignaciones en una plataforma moderna. 
              Monitorea, optimiza y toma decisiones basadas en datos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95"
            >
              <BarChart3 size={18} />
              Dashboard Ejecutivo
            </Link>
            <Link
              href="/activos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              Explorar Inventario
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>


      {/* Tarjeta de Datos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{stat.desc}</p>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Modules Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Módulos Principales
          </h2>
          <p className="text-gray-500 mt-1">
            Accede a cada sección para gestionar tu infraestructura tecnológica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1"
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${module.lightBg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-50`} />

              <div className="relative z-10 p-6 space-y-4">
                
                {/* Icon */}
                <div className={`w-12 h-12 ${module.lightBg} rounded-xl flex items-center justify-center ${module.accentColor}`}>
                  {module.icon}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all pt-2">
                  {module.action}
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-blue-600" />
            Actividad Reciente
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100"
              >
                <div className="pt-1">
                  {activity.type === "maintenance" && (
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <Wrench size={16} />
                    </div>
                  )}
                  {activity.type === "assignment" && (
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <ClipboardCheck size={16} />
                    </div>
                  )}
                  {activity.type === "alert" && (
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {activity.detail}
                  </p>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Zap size={20} className="text-emerald-600" />
            Acceso Rápido
          </h2>

          <div className="space-y-2">
            {[
              { href: "/activos", label: "Activos", icon: Package },
              { href: "/usuarios", label: "Usuarios", icon: Users },
              { href: "/mantenimientos", label: "Mantenimiento", icon: Wrench },
              { href: "/asignaciones", label: "Asignaciones", icon: ClipboardCheck },
              { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
              { href: "/activos", label: "Reportes", icon: TrendingUp },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-200 group"
                >
                  <Icon size={16} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {link.label}
                  </span>
                  <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-blue-400 transition-colors" />
                </Link>
              );
            })}
          </div>

          <Link
            href="/dashboard"
            className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-center text-sm"
          >
            Ver Dashboard Completo
          </Link>
        </div>
      </div>

      {/* Alert Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 mt-1">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">3 Alertas Críticas</h3>
            <p className="text-sm text-red-700 mt-1">
              Hay 3 mantenimientos vencidos y 4 asignaciones próximas a vencer. 
              <Link href="/dashboard" className="ml-1 font-bold text-red-800 hover:underline">
                Revisar ahora →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        <p>© 2024 Sistema de Gestión de Activos Tecnológicos. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}