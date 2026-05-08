"use client";

import { useState, useEffect, use } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { useMantenimientoStore } from "@/store/mantenimientoStore";
import { NuevoMantenimiento } from "@/components/mantenimiento/NuevoMantenimiento";
import { CambiarEstado } from "@/components/mantenimiento/CambiarEstado";
import { EditarMantenimiento } from "@/components/mantenimiento/EditarMantenimiento";

type Mantenimiento = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: string;
  responsable: string;
  estado: string;
  activo?: {
    id: number;
    nombre: string;
    categoria: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    ubicacion: string;
    estado: string;
  };
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
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const actualizar = useMantenimientoStore((state) => state.actualizar);

  const [modoEdicion, setModoEdicion] = useState(false);


  // Cargar mantenimientos desde la API
  useEffect(() => {
    setCargando(true);
    fetch("/api/mantenimientos")
      .then((res) => res.json())
      .then((data) => {
        setMantenimientos(data);
        setCargando(false);
      });
  }, [actualizar]); //Para recargar la lista cuando se actualice el store

  // Reiniciar la pagina actual al cambiar busqueda o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  // Filtro de busqueda y filtros de tabla
  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      (m.activo_nombre?.toLowerCase() || "").includes(texto) ||
      (m.tipo?.toLowerCase() || "").includes(texto) ||
      (m.responsable?.toLowerCase() || "").includes(texto);
    
    const coincideTipo = filtroTipo === "" || m.tipo?.toLowerCase() === filtroTipo.toLowerCase();
    const coincideEstado = filtroEstado === "" || m.estado?.toLowerCase() === filtroEstado.toLowerCase();
    
    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(mantenimientosFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const mantenimientosPagina = mantenimientosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  // Funcion auxiliar para mostrar estado con colores y etiquetas
  function colorEstado(estado: string) {
    switch (estado) {
      case "pendiente":     return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "en_proceso":     return "bg-blue-100 text-blue-700 border border-blue-200";
      case "programado":    return "bg-purple-100 text-purple-700 border border-purple-200";
      case "pendiente_de_respuesta":     return "bg-orange-100 text-orange-700 border border-orange-200";
      case "vencido":     return "bg-red-100 text-red-700 border border-red-200";
      case "finalizado":     return "bg-green-100 text-green-700 border border-green-200";
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
      case "finalizado": return "Finalizado";
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

  //
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
              <button 
              onClick={() => setMostrarNuevo(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Responsable</th>
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
                  <tr key={mantenimiento.id} onClick={() => {
                      // seleccionar / deseleccionar fila
                      setSelectedMantenimiento((prev) => (prev?.id === mantenimiento.id ? null : mantenimiento));
                      setMostrarDetalle(false);
                    }}
                    className={`transition-colors group cursor-pointer ${selectedMantenimiento?.id === mantenimiento.id ? 'bg-blue-100/60' : 'hover:bg-blue-50/30'}`}
                  >
                    {/* -- */}
                    <td className="px-6 py-4 text-sm text-gray-900">{mantenimiento.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mantenimiento.activo_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{labelTipo(mantenimiento.tipo)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(mantenimiento.fecha_programada).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(mantenimiento.estado)}`}>
                        {labelEstado(mantenimiento.estado)}  
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      <div className="flex items-center justify-end gap-3">
                        <span>{mantenimiento.responsable ?? "- -"}</span>
                        {/* Botón ojo que aparece cuando la fila está seleccionada */}
                        {selectedMantenimiento?.id === mantenimiento.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMostrarDetalle(true); }}
                            aria-label="Ver detalle"
                            className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Superposición de detalle */}
        {mostrarDetalle && selectedMantenimiento && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => {setMostrarDetalle(false); setModoEdicion(false);}} />
            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4 p-6 z-10">
              {/*Header de detalle*/}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMantenimiento.activo_nombre}</h2>
                  <p className="text-sm text-gray-500">ID #{selectedMantenimiento.id} · {labelTipo(selectedMantenimiento.tipo)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón editar / cancelar edición */}
                  <button
                    onClick={() => setModoEdicion((prev) => !prev)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      modoEdicion
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {modoEdicion ? "Cancelar" : "Editar"}
                  </button>

                  <button onClick={() => { setMostrarDetalle(false); setModoEdicion(false); }} className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                {/* Columna Mantenimiento */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Información del Mantenimiento</h3>
                  </div>
                  
                  {/* Mostrar los datos del mantenimiento */}
                  {modoEdicion ? (
                    // Editar los datos del mantenimiento
                    <EditarMantenimiento
                      mantenimiento={selectedMantenimiento}
                      onGuardado={(actualizado) => {
                        setSelectedMantenimiento(actualizado);
                        setModoEdicion(false);
                        // Recargas la tabla o actualizas localmente si lo prefieres
                        useMantenimientoStore.getState().refrescar();
                      }}
                    />
                  ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      {/* Responsable*/}
                      <div className="text-xs text-gray-500 uppercase font-semibold">Responsable</div>
                      <div className="mt-0.5 text-gray-700 font-medium">{selectedMantenimiento.responsable}</div>
                    </div>
                    <div>
                      {/* Fecha Programada */}
                      <div className="text-xs text-gray-500 uppercase font-semibold">Fecha Programada</div>
                      <div className="mt-0.5 text-gray-700 font-medium">{new Date(selectedMantenimiento.fecha_programada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div>
                      {/* Descripción */}
                      <div className="text-xs text-gray-500 uppercase font-semibold">Descripción</div>
                      <div className="mt-1.5 p-3 bg-gray-50 rounded-xl text-gray-600 italic border border-gray-100">
                        "{selectedMantenimiento.descripcion}"
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Columna Activo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Detalles del Activo</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Marca y Modelo ocupa las 2 columnas */}
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 uppercase font-semibold">Marca y Modelo</div>
                      <div className="mt-0.5 text-gray-700 font-medium">
                        {selectedMantenimiento.activo?.marca} {selectedMantenimiento.activo?.modelo}
                      </div>
                    </div>

                    {/* Número de Serie */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Número de Serie</div>
                      <div className="mt-0.5 text-gray-700 font-medium">{selectedMantenimiento.activo?.numero_serie}</div>
                    </div>

                    {/* Categoría — misma fila que número de serie */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Categoría</div>
                      <div className="mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                          {selectedMantenimiento.activo?.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Ubicación — misma fila que estado actual */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Ubicación</div>
                      <div className="mt-0.5 text-gray-700 font-medium">
                        {selectedMantenimiento.activo?.ubicacion ?? 'No especificada'}
                      </div>
                    </div>

                    {/* Estado actual — misma fila que ubicación */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Estado Actual</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(selectedMantenimiento.estado)}`}>
                          {labelEstado(selectedMantenimiento.estado)}
                        </span>
                      </div>
                    </div>

                    {/* Cambiar estado — ocupa las 2 columnas, al final */}
                    <div className="col-span-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Cambiar Estado</div>
                      <CambiarEstado
                        mantenimiento={selectedMantenimiento}
                        onActualizado={(nuevoEstado: string) => {
                          setSelectedMantenimiento((prev) =>
                            prev ? { ...prev, estado: nuevoEstado } : prev
                          );
                          useMantenimientoStore.getState().refrescar();
                        }}
                      />
                    </div>

                  </div>
                </div>
                </div>

              {/* Botón Cerrar */}
              <div className="mt-6 flex justify-end">
                <button onClick={() => setMostrarDetalle(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cerrar</button>
              </div>
            </div>
          </div>
        )}

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
        {/*Aca el modal de nuevo mantenimiento*/}
        <NuevoMantenimiento
          isOpen={mostrarNuevo}
          onClose={() => setMostrarNuevo(false)}
        />
      </div>
      </div>
  );
}
