"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Plus, ChevronLeft, ChevronRight, Trash2, Eye, X
} from "lucide-react";
import { Activo } from "@/tipos/activo";
import { NuevoActivo } from "@/components/activos/NuevoActivo";
import { useActivoStore } from "@/store/activoStore";
import { EditarActivo } from "@/components/activos/EditarActivo";

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
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const actualizar = useActivoStore((state) => state.actualizar);

  const [modoEdicion, setModoEdicion] = useState(false);

    // Resetear modo edicion al cerrar el detalle
  useEffect(() => {
    if (!mostrarDetalle) {
      setModoEdicion(false);
    }
  }, [mostrarDetalle]);
  
  // Carga activos desde la API
  useEffect(() => {
    setCargando(true);
    fetch("/api/activos")
      .then((res) => res.json())
      .then((data) => {
        setActivos(data);
        setCargando(false);
      });
  }, [actualizar]); // Para recargar la lista cuando se actualice desde el store

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
              
              <button
                onClick={() => setMostrarNuevo(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
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
                  // Aca para cada activo se renderiza una fila, con un onClick para seleccionar/deseleccionar y mostrar el detalle al hacer click en el icono de ojo
                  <tr
                    key={activo.id}
                    onClick={() => {
                      // seleccionar / deseleccionar fila
                      setSelectedActivo((prev) => (prev?.id === activo.id ? null : activo));
                      setMostrarDetalle(false);
                    }}
                    className={`transition-colors group cursor-pointer ${selectedActivo?.id === activo.id ? 'bg-blue-100/60' : 'hover:bg-blue-50/30'}`}
                  >
                    {/* -- */}
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
                      {/* Ubicación y botón de detalle */}
                      <div className="flex items-center justify-end gap-3">
                        <span>{activo.ubicacion ?? "Sin ubicación"}</span>
                        
                        {/* Botón ojo que aparece cuando la fila está seleccionada */}
                        {selectedActivo?.id === activo.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMostrarDetalle(true); }}
                            aria-label="Ver detalle"
                            className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                      </div>
                      {/* Aca finaliza lo del ojo /*/}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Superposición de detalle */}
        {mostrarDetalle && selectedActivo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMostrarDetalle(false)} />
            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4 p-6 z-10">

              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {/*<div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="text-lg">💻</span>
                  </div>*/}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedActivo.nombre}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">ID #{selectedActivo.id}</span>
                      <span className="text-gray-200">·</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase">
                        {selectedActivo.categoria}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorEstado(selectedActivo.estado)}`}>
                        {labelEstado(selectedActivo.estado)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Editar / Cancelar */}
                <div className="flex items-center gap-2">
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
                  <button
                    onClick={() => { setMostrarDetalle(false); setModoEdicion(false); }}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
              </div>
              </div>

              {/* Body */}
              {modoEdicion ? (
              // Modo Edicion
              <div className="mt-4">
                <EditarActivo
                  activo={selectedActivo}
                  onGuardado={(actualizado) => {
                    setSelectedActivo(actualizado);
                    setModoEdicion(false);
                    useActivoStore.getState().refrescar();
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">

                {/* Sección — Identificación */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Identificación</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Marca</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">{selectedActivo.marca}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Modelo</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">{selectedActivo.modelo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Número de Serie</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-mono font-medium">{selectedActivo.numero_serie}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-50" />

                {/* Sección — Ubicación y compra */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ubicación y Compra</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Ubicación</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">
                        {selectedActivo.ubicacion ?? <span className="text-gray-400 italic">Sin ubicación</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Fecha de Compra</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">
                        {selectedActivo.fecha_compra
                          ? new Date(selectedActivo.fecha_compra).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                          : <span className="text-gray-400 italic">No registrada</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Valor de Compra</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">
                        {selectedActivo.valor_compra
                          ? `$${Number(selectedActivo.valor_compra).toLocaleString('es-CO')}`
                          : <span className="text-gray-400 italic">No registrado</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Proveedor</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">
                        {selectedActivo.proveedor ?? <span className="text-gray-400 italic">No registrado</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Responsable</div>
                      <div className="mt-0.5 text-sm text-gray-800 font-medium">
                        {selectedActivo.empleadoResponsable?.nombre ?? <span className="text-gray-400 italic">Sin asignar</span>}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setMostrarDetalle(false)}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

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
        {/*  Aca el modal de nuevo activo  */}
        <NuevoActivo isOpen={mostrarNuevo} onClose={() => setMostrarNuevo(false)} />
      </div>
    </div>
  );
}