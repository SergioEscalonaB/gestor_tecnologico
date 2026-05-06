"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Plus, ChevronLeft, ChevronRight, Trash2
} from "lucide-react";
import { Activo } from "@/tipos/activo";

const ITEMS_POR_PAGINA = 8;

// Componente principal de Activos
export default function Activos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Carga activos desde la API
  useEffect(() => {
    setCargando(true);
    fetch("/api/activos")
      .then((res) => res.json())
      .then((data) => {
        setActivos(data);
        setCargando(false);
      });
  }, []);

  // Reinicia la página actual al cambiar búsqueda o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroCategoria, filtroEstado]);

  function normalizarTexto(texto: string) {
    return texto.trim().toLowerCase();
  }

  // Filtra por búsqueda en el cliente (nombre, marca, numero_serie)
  const activosFiltrados = activos.filter((a) => {
    const texto = normalizarTexto(busqueda);
    const categoriaActivo = normalizarTexto(a.categoria);
    return (
      a.nombre.toLowerCase().includes(texto)       ||
      a.marca.toLowerCase().includes(texto)        ||
      a.numero_serie.toLowerCase().includes(texto) ||
      categoriaActivo.includes(texto)
    );
  }).filter((a) => {
    const categoriaActivo = normalizarTexto(a.categoria);
    const estadoActivo = normalizarTexto(a.estado);

    return (
      (!filtroCategoria || categoriaActivo.includes(normalizarTexto(filtroCategoria))) &&
      (!filtroEstado || estadoActivo === normalizarTexto(filtroEstado))
    );
  });

  // Paginación
  const totalPaginas = Math.ceil(activosFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const activosPagina = activosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  // Funciones auxiliares para mostrar estado con colores y etiquetas legibles
  function colorEstado(estado: string) {
    switch (estado) {
      case "disponible":    return "bg-green-100 text-green-700 border border-green-200";
      case "en_uso":        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "mantenimiento": return "bg-orange-100 text-orange-700 border border-orange-200";
      case "dado_baja":     return "bg-red-100 text-red-700 border border-red-200";
      default:              return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  }

  // Convierte el estado del activo a una etiqueta legible
  function labelEstado(estado: string) {
    switch (estado) {
      case "disponible":    return "Disponible";
      case "en_uso":        return "En Uso";
      case "mantenimiento": return "En Mantenimiento";
      case "dado_baja":     return "Dado de Baja";
      default:              return estado;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Activos</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Inventario</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-blue-600 font-medium">Activos</span>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Barra de búsqueda y filtros */}
        <div className="p-4 md:p-6 flex flex-col gap-4 bg-white border-b border-gray-50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Búsqueda */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, serie..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Botón filtros */}
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
                {(filtroCategoria || filtroEstado) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
                <Plus size={20} />
                <span>Nuevo Activo</span>
              </button>
            </div>
          </div>

          {/* Panel de filtros desplegable */}
          {mostrarFiltros && (
            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-gray-100">
              
              {/* Filtro categoría */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="computador">Computador</option>
                  <option value="celular">Celular</option>
                  <option value="impresora">Impresora</option>
                  <option value="red">Red</option>
                  <option value="monitor">Monitor</option>
                </select>
              </div>

              {/* Filtro estado */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="disponible">Disponible</option>
                  <option value="en_uso">En Uso</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="dado_baja">Dado de Baja</option>
                </select>
              </div>

              {/* Botón limpiar filtros */}
              {(filtroCategoria || filtroEstado) && (
                <div className="flex items-end">
                  <button
                    onClick={() => { setFiltroCategoria(""); setFiltroEstado(""); }}
                    className="px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Cargando activos...
                  </td>
                </tr>
              ) : activosPagina.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No se encontraron activos
                  </td>
                </tr>
              ) : (
                activosPagina.map((activo) => (
                  <tr key={activo.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">#{activo.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{activo.nombre}</span>
                        <span className="text-xs text-gray-400">{activo.numero_serie}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {activo.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activo.marca}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(activo.estado)}`}>
                        {labelEstado(activo.estado)}
                        {activo.estado === "dado_baja" && <Trash2 size={12} />}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {activo.ubicacion ?? "Sin ubicación"}
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
            <span className="font-semibold text-gray-900">{Math.min(inicio + 1, activosFiltrados.length)}</span>
            {" "}a{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + ITEMS_POR_PAGINA, activosFiltrados.length)}</span>
            {" "}de{" "}
            <span className="font-semibold text-gray-900">{activosFiltrados.length}</span> registros
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