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
  activdoId: number;
  activoNombre: string;
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
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
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
            <tbody>
              
            </tbody>
          </table>
        </div>
      </div>




      </div>
  );
}
