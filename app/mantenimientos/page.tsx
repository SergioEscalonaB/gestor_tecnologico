"use client";

import { useState, useEffect, use } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

type Mantenimiento = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: Date;
  responsable: string;
  estado: string;
};

const ITEMS_POR_PAGINA = 8;

//Componentes principales de Manteminientos
export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(false);

  // Cargar mantenimientos desde la API
  useEffect(() => {
    setCargando(true);
    fetch("/api/mantenimientos")
      .then((res) => res.json())
      .then((data) => {
        setMantenimientos(data);
        setCargando(false);
      });
  }, []);

  // Reiniciar la pagina actual al cambiar busqueda o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  // Filtro de busqueda y filtros de tabla
  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const coincideBusqueda =
      (m.activo_nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (m.tipo?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (m.responsable?.toLowerCase() || "").includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === "" || m.tipo?.toLowerCase() === filtroTipo.toLowerCase();
    const coincideEstado = filtroEstado === "" || m.estado?.toLowerCase() === filtroEstado.toLowerCase();
    
    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(mantenimientosFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const mantenimientosPagina = mantenimientosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  // Funcion auxiliar para mostrar estado con colores y etiquetas
  function colorEstado(estado: string) {
    switch (estado) {
      case "pendiente":     return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "en_proceso":     return "bg-blue-100 text-blue-700 border border-blue-200";
      case "programado":    return "bg-purple-100 text-purple-700 border border-purple-200";
      case "pendiente_de_respuesta":     return "bg-orange-100 text-orange-700 border border-orange-200";
      case "vencido":     return "bg-red-100 text-red-700 border border-red-200";
      default:              return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  }

  // Convierte el estado del mantenimiento a una etiqueta legible
  function labelEstado(estado: string) {
    switch (estado) {
      case "pendiente": return "Pendiente";
      case "en_proceso": return "En Proceso";
      case "programado": return "Programado";
      case "pendiente_de_respuesta": return "Pendiente de Respuesta";
      case "vencido": return "Vencido";
      default: return estado;
    }
  }

  // Convierte el tipo de mantenimiento a una etiqueta legible
  function labelTipo(tipo: string) {
    switch (tipo) {
      case "preventivo": return "Preventivo";
      case "correctivo": return "Correctivo";
      case "revision_general": return "Revision General";
      case "revision_de_software": return "Revision de Software";
      default: return tipo;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mantenimientos</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Estado</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-blue-600 font-medium">Mantenimientos</span>
        </div>
      </div>
      
      {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">  

        {/* Barra de búsqueda y filtros */}
        <div className="p-4 md:p-6 flex flex-col gap-4 bg-white border-b border-gray-50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/*Barra de búsqueda*/}
              <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar mantenimientos"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              />    
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Boton filtros */}
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors shadow-sm font-medium ${
                  mostrarFiltros
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={18} />
                <span>Filtros</span>
                {/* Punto indicador si hay filtros activos */}
                {(filtroTipo || filtroEstado) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Boton nuevo mantenimiento */}
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
                <Plus size={20} />
                <span>Nuevo Mantenimiento</span>
              </button>
            </div>
          </div>
          
          {/* Panel de filtros desplegables */}
          {mostrarFiltros && (
            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-gray-100">

              {/* Filtro de Tipo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de mantenimiento</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => { setFiltroTipo(e.target.value); }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>
              
              {/* Filtro de Estado */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => { setFiltroEstado(e.target.value); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="programado">Programado</option>
                    <option value="pendiente_de_respuesta">Pendiente de Respuesta</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>

                {/* Boton limpiar filtros */}
                {(filtroTipo || filtroEstado) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => { setFiltroTipo(""); setFiltroEstado(""); }}
                      className="px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
            </div>
          ) }
      </div>

      {/* Tabla de mantenimientos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de mantenimiento</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha programada</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Responsable</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Cargando mantenimientos...
                  </td>
                </tr>
              ) : mantenimientosPagina.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No se encontraron mantenimientos.
                  </td>
                </tr>
              ) : (
                mantenimientosPagina.map((mantenimiento) => (
                  <tr key={mantenimiento.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{mantenimiento.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mantenimiento.activo_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{labelTipo(mantenimiento.tipo)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(mantenimiento.fecha_programada).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{mantenimiento.responsable}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(mantenimiento.estado)}`}>
                        {labelEstado(mantenimiento.estado)}  
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-6 bg-white border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + 1, mantenimientosFiltrados.length)}</span>
            {" "}a{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + ITEMS_POR_PAGINA, mantenimientosFiltrados.length)}</span>
            {" "}de{" "}
            <span className="font-semibold text-gray-900">{mantenimientosFiltrados.length}</span> registros
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPaginaActual(p as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                        paginaActual === p
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      </div>
  );
}
