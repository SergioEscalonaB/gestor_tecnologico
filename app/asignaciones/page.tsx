"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight, Trash2, Eye, X
} from "lucide-react";
import { Asignacion } from "@/tipos/asignaciones";

const ITEMS_POR_PAGINA = 8;

//COomponente principal de Asignaciones
export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  // Filtro no utilizare
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);

  //Cargar asignaciones de la API
  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        const res = await fetch("/api/asignaciones");
        const datos = await res.json();
        setAsignaciones(datos);
      } catch (error) {
        console.error("Error al cargar asignaciones:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarAsignaciones();
  }, []);


  //Reinicia la pagina actual al cambiar busqueda o filtros (desabilitado)
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);


  function normalizarTexto(texto: string) {
    return texto.trim().toLowerCase();
  }

  // Filtra por busqueda en la asignacion
  const asignacionesFiltradas = asignaciones.filter(a => {
    const texto = normalizarTexto(busqueda);
    
    // Campos de texto para buscar
    const nombreActivo = a.activo?.nombre || "";
    const nombreEmpleado = a.empleado?.nombre || "";
    const cedulaEmpleado = a.empleado?.cedula?.toString() || "";
    const fechaInicioStr = a.fecha_inicio.toString();
    const fechaFinStr = a.fecha_fin?.toString() || "";
    const idActivoStr = a.activoId.toString();

    return (
      normalizarTexto(nombreActivo).includes(texto) || 
      normalizarTexto(nombreEmpleado).includes(texto) || 
      normalizarTexto(cedulaEmpleado).includes(texto) ||
      normalizarTexto(fechaInicioStr).includes(texto) || 
      normalizarTexto(fechaFinStr).includes(texto) ||
      idActivoStr.includes(texto)
    );
  });
  
  // Paginacion
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const asignacionesPagina = asignacionesFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asignaciones</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Asignaciones</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-blue-600 font-medium">Historial de Asignaciones</span>
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
                placeholder="Buscar por empleado, activo o fecha"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Botón filtros y boton nuevo*/}  
            </div>
          </div>

          {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Codigo Activo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Activo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cedula Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? ( 
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Cargando...
                  </td>
                </tr>
              ) : asignacionesPagina.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">No hay asignaciones</td>
                </tr>
              ) : asignacionesPagina.map((a) => (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{a.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.activoId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.activo?.nombre || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.empleado?.nombre || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.empleado?.cedula || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.fecha_inicio}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.fecha_fin || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="p-6 bg-white border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + 1, asignacionesFiltradas.length)}</span>
            {" "}a{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + ITEMS_POR_PAGINA, asignacionesFiltradas.length)}</span>
            {" "}de{" "}
            <span className="font-semibold text-gray-900">{asignacionesFiltradas.length}</span> registros
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
    </div>
  )

}