"use client"

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Empleado } from "@/tipos/empleado";

const ITEMP_POR_PAGINA = 8;

// Componente de la página de usuarios
export default function Usuarios() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  
  // Carga empleados desde la API
  useEffect(() => {
    setCargando(true);
    fetch('/api/empleados')
    .then((res) => res.json())
    .then((data) => {
      setEmpleados(data);
      setCargando(false);
    });
  }, []);

  // Reinicia la página actual al cambiar búsqueda o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroCargo, filtroArea]);

  function normalizarTexto(texto: string) {
    return texto.trim().toLowerCase();
  }

  // Filtra por busqueda entre empleados
  const empleadosFiltrados = empleados.filter((empleado) => {
    const texto = normalizarTexto(busqueda);
    const coincideBusqueda = !busqueda || 
      normalizarTexto(empleado.nombre).includes(texto) ||
      normalizarTexto(empleado.cargo).includes(texto) ||
      normalizarTexto(empleado.area).includes(texto) ||
      normalizarTexto(empleado.correo_electronico).includes(texto);

    const coincideFiltroCargo = !filtroCargo || empleado.cargo === filtroCargo;
    const coincideFiltroArea = !filtroArea || empleado.area === filtroArea;
    
    return coincideBusqueda && coincideFiltroCargo && coincideFiltroArea;
  });

  // Paginación
  const totalPaginas = Math.ceil(empleadosFiltrados.length / ITEMP_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMP_POR_PAGINA;
  const fin = inicio + ITEMP_POR_PAGINA;
  const empleadosPaginados = empleadosFiltrados.slice(inicio, inicio + ITEMP_POR_PAGINA);
  

  // Obteniendo cargos y áreas únicos dinámicamente de los datos de empleados
  const cargosUnicos = useMemo(() => {
    const cargos = empleados.map(e => e.cargo).filter(Boolean);
    return Array.from(new Set(cargos)).sort();
  }, [empleados]);

  const areasUnicas = useMemo(() => {
    const areas = empleados.map(e => e.area).filter(Boolean);
    return Array.from(new Set(areas)).sort();
  }, [empleados]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Usuarios</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Gestión de usuarios</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-blue-600 font-medium">Usuarios</span>
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
                {(filtroCargo || filtroArea) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
                <Plus size={20} />
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* Panel de filtros desplegable */}
          {mostrarFiltros && (
            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-gray-100">
              
              {/* Filtro categoría - buscando antes la bd*/}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
                <select
                  value={filtroCargo}
                  onChange={(e) => setFiltroCargo(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todos los cargos</option>
                  {cargosUnicos.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>

              {/* Filtro área - buscando antes la bd */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Área</label>
                <select
                  value={filtroArea}
                  onChange={(e) => setFiltroArea(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todas las áreas</option>
                  {areasUnicas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Botón limpiar filtros */}
              {(filtroCargo || filtroArea) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFiltroCargo("");
                      setFiltroArea("");
                    }}
                    className="px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
                )}
            </div>
          )}
        </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Área</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Correo Electrónico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Cargando usuarios...</td>
                </tr>
              ) : empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No se encontraron usuarios con esos filtros</td>
                </tr>
              ) : (
                empleadosPaginados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{empleado.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.cargo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{empleado.correo_electronico}</td>
                  </tr>
                ))
              ) }
            </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Mostrando <span className="font-medium">{inicio + 1}</span> a <span className="font-medium">{Math.min(fin, empleadosFiltrados.length)}</span> de <span className="font-medium">{empleadosFiltrados.length}</span> resultados
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  paginaActual === i + 1
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:bg-white text-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

