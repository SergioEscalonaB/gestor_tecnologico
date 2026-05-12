"use client"

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  X,
  User,
  Building2,
  MapPin,
  Mail,
  Pencil,
  Clock,
  History,
} from "lucide-react";
import { Empleado } from "@/tipos/empleado";
import { useUsuarioStore } from "@/store/usuarioStore";
import { NuevoUsuario } from "@/components/usuarios/NuevoUsuario";

const ITEMS_POR_PAGINA = 8;

// Componente de la página de usuarios
export default function Usuarios() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  // Para lo del seleccionador (lo que selecciona el empleadp)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [detalleEmpleado, setDetalleEmpleado] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Carga los datos completos del empleado cuando se abre el detalle
  useEffect(() => {
    if (mostrarDetalle && selectedEmpleado) {
      setCargandoDetalle(true);
      fetch(`/api/empleados/${selectedEmpleado.id}`)
        .then((res) => res.json())
        .then((data) => {
          setDetalleEmpleado(data);
          setCargandoDetalle(false);
        })
        .catch(() => setCargandoDetalle(false));
    }
  }, [mostrarDetalle, selectedEmpleado]);

  // Para lo del nuevo usuario
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const actualizar = useUsuarioStore(state => state.actualizar);

  // Carga empleados desde la API
  useEffect(() => {
    setCargando(true);
    fetch('/api/empleados')
    .then((res) => res.json())
    .then((data) => {
      setEmpleados(data);
      setCargando(false);
    });
  }, [actualizar]); // Para recargar la lista cuando se actualice el store

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
  const totalPaginas = Math.ceil(empleadosFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const empleadosPaginados = empleadosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  

  // Obteniendo cargos y áreas únicos dinámicamente de los datos de empleados
  const cargosUnicos = useMemo(() => {
    const cargos = empleados.map(e => e.cargo).filter(Boolean);
    return Array.from(new Set(cargos)).sort();
  }, [empleados]);

  // Obtener áreas únicas
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
      {/* Contenido principal */}
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
                {(filtroCargo || filtroArea) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Boton nuevo usuaruo */}
              <button 
              onClick={() => setMostrarNuevo(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cedula</th>
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
                  <tr key={empleado.id} onClick={() => {
                    //Seleccionar / deseleccionar fila
                    setSelectedEmpleado((prev) => prev?.id === empleado.id ? null : empleado);
                    setMostrarDetalle(false);
                  }}
                  className={`hover:bg-gray-50/50 transition-colors ${selectedEmpleado?.id === empleado.id ? "bg-blue-50" : ""}`}
                >
                  {/* -- */}
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.cedula}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{empleado.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.cargo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{empleado.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      <div className="flex items-center justify-end gap-3">
                        <span>{empleado.correo_electronico ?? "- -"}</span>
                        {/* Botón ojo que aparece cuando la fila está seleccionada */}
                        {selectedEmpleado?.id === empleado.id && (
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
              ) }
            </tbody>
        </table>
      </div>

      {/* Superposicion de detalle */}
      {mostrarDetalle && selectedEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMostrarDetalle(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in duration-200">
            
            {/* Header principal */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">Detalle del Usuario: {selectedEmpleado.nombre}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium text-blue-600">ID #{selectedEmpleado.id}</span>
                    <span>•</span>
                    <span>{selectedEmpleado.cargo}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMostrarDetalle(false)}
                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido Scrolleable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Parte 1:Información del Usuario */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Información del Usuario</h4>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <Pencil size={14} />
                    Editar Usuario
                  </button>
                </div>

                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Avatar y Datos Básicos */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    {/* 
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-4 border-white">
                      {selectedEmpleado.nombre.charAt(0)}
                    </div>*/}

                    <div className="text-center md:text-left">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 mb-2 uppercase">
                        Activo
                      </span>
                      <p className="text-sm font-semibold text-gray-900">{selectedEmpleado.nombre}</p>
                      <p className="text-xs text-gray-500">{selectedEmpleado.correo_electronico}</p>
                    </div>
                  </div>

                  {/* Detalles Laborales */}
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <Building2 size={14} />
                        Departamento
                      </div>
                      <p className="text-gray-700 font-medium">{selectedEmpleado.area}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <User size={14} />
                        Cargo / Rol
                      </div>
                      <p className="text-gray-700 font-medium">{selectedEmpleado.cargo}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <MapPin size={14} />
                        Ubicación
                      </div>
                      <p className="text-gray-700 font-medium">{selectedEmpleado.area} - Sede Principal</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <Mail size={14} />
                        Email Corporativo
                      </div>
                      <p className="text-gray-700 font-medium break-all">{selectedEmpleado.correo_electronico}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Parte 2: Equipos Asignados */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Equipos Asignados y Uso Actual</h4>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Código</th>
                        <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Activo</th>
                        <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Estado</th>
                        <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Fecha de Asignación</th>
                        <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px] text-right">Historial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cargandoDetalle ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">Cargando equipos...</td></tr>
                      ) : !detalleEmpleado?.activosResponsable || detalleEmpleado.activosResponsable.filter((a: any) => a.estado === 'en_uso' || a.estado === 'mantenimiento').length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No hay equipos asignados actualmente</td></tr>
                      ) : (
                        detalleEmpleado.activosResponsable.filter((a: any) => a.estado === 'en_uso' || a.estado === 'mantenimiento').map((activo: any) => (
                          <tr key={activo.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{activo.numero_serie}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-900">{activo.nombre}</p>
                              <p className="text-[10px] text-gray-500">{activo.marca} {activo.modelo}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                activo.estado === 'disponible' ? 'bg-green-100 text-green-700' :
                                activo.estado === 'en_uso' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {activo.estado === 'en_uso' ? 'En uso' : activo.estado === 'mantenimiento' ? 'Mantenimiento' : activo.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-gray-400" />
                                {new Date(activo.fecha_compra).toLocaleDateString('es-ES')}
                              </div>
                            </td>
                            {/* Boton para ver historial de asignaciones*/}
                            <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-1 justify-end ml-auto">
                                <Eye size={12} />
                                Ver Historial
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Parte 3: Historial de Asignaciones */}
              <section className="space-y-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Historial de Asignaciones</h4>
                </div>

                <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 ml-2">
                  {cargandoDetalle ? (
                    <p className="pl-8 text-sm text-gray-400 italic">Cargando historial...</p>
                  ) : !detalleEmpleado?.asignaciones || detalleEmpleado.asignaciones.length === 0 ? (
                    <p className="pl-8 text-sm text-gray-400 italic">Sin historial registrado</p>
                  ) : (
                    detalleEmpleado.asignaciones.map((asig: any) => (
                      <div key={asig.id} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-5 h-5 bg-white border-2 border-blue-500 rounded-full z-10 shadow-sm" />
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-all hover:bg-white hover:shadow-md group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                              {new Date(asig.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                            </span>
                            {asig.fecha_fin && (
                              <span className="text-[10px] font-medium text-gray-400 italic">
                                Finalizado en {new Date(asig.fecha_fin).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {asig.activo?.nombre} <span className="text-gray-400 font-normal">({asig.activo?.marca} {asig.activo?.modelo})</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {asig.fecha_fin 
                              ? `Asignación completada. Activo devuelto / Reasignado.` 
                              : `Asignación activa de ${asig.activo?.nombre} a ${selectedEmpleado.nombre}.`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-gray-100 flex justify-end bg-white">
              <button
                onClick={() => setMostrarDetalle(false)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Paginación */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + 1, empleadosFiltrados.length)}</span>
            {" "}a{" "}
            <span className="font-semibold text-gray-900">{Math.min(inicio + ITEMS_POR_PAGINA, empleadosFiltrados.length)}</span>
            {" "}de{" "}
            <span className="font-semibold text-gray-900">{empleadosFiltrados.length}</span> registros
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

      {/* Modal Nuevo Usuario */}
      <NuevoUsuario
        isOpen={mostrarNuevo}
        onClose={() => setMostrarNuevo(false)}
      />
    </div>
  </div>
);
}

