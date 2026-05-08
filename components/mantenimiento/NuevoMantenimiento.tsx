"use client";

import React, { useState, useEffect } from "react";
import {
  X, Hash, MapPin, Calendar, Search,
  ChevronDown, Package, FileText, User, Tag
} from "lucide-react";
import { useMantenimientoStore } from "@/store/mantenimientoStore";

// Tipo para los activos
type ActivoSimple = {
  id: number;
  nombre: string;
  numero_serie: string;
  categoria: string;
};

// Props del componente
interface NuevoMantenimientoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoMantenimiento = ({ isOpen, onClose }: NuevoMantenimientoProps) => {
  const refrescar = useMantenimientoStore((state) => state.refrescar);

  // Campos del formulario
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [responsable, setResponsable] = useState("");
  const [estado, setEstado] = useState("programado");

  // Buscador de activo
  const [busquedaActivo, setBusquedaActivo] = useState("");
  const [activos, setActivos] = useState<ActivoSimple[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<ActivoSimple | null>(null);
  const [mostrarSugerenciasActivo, setMostrarSugerenciasActivo] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Busca activos mientras escribe
  useEffect(() => {
    if (busquedaActivo.length < 2) {
      setActivos([]);
      return;
    }
    fetch("/api/activos")
      .then((res) => res.json())
      .then((data: ActivoSimple[]) => {
        const filtrados = data.filter((a) =>
          a.nombre.toLowerCase().includes(busquedaActivo.toLowerCase()) ||
          a.numero_serie.toLowerCase().includes(busquedaActivo.toLowerCase())
        );
        setActivos(filtrados);
        setMostrarSugerenciasActivo(true);
      });
  }, [busquedaActivo]);

  // Limpia el formulario
  function limpiarFormulario() {
    setTipo(""); setDescripcion(""); setFechaProgramada("");
    setResponsable(""); setEstado("programado");
    setBusquedaActivo(""); setActivoSeleccionado(null);
    setError("");
  }

  // Cierra el formulario
  function handleCerrar() {
    limpiarFormulario();
    onClose();
  }

  // Guarda el mantenimiento
  async function handleGuardar() {
    if (!activoSeleccionado || !tipo || !descripcion || !fechaProgramada || !responsable || !estado) {
      setError("Todos los campos marcados con * son obligatorios.");
      return;
    }

    setCargando(true);
    setError("");

    try {
        // Envia el nuevo mantenimiento al api
      const res = await fetch("/api/mantenimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activoId:         activoSeleccionado.id,
          tipo,
          descripcion,
          fecha_programada: fechaProgramada,
          responsable,
          estado,
        }),
      });

      if (!res.ok) {
        let mensaje = "Error al guardar el mantenimiento";
        try {
          const data = await res.json();
          mensaje = data.error ?? mensaje;
        } catch { 
            // Si no viene el JSON, muestra el mensaje por defecto
         }
        setError(mensaje);
        return;
      }

      refrescar(); // Avisa a la lista que recargue
      handleCerrar(); // Cierra el formulario
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false); // Siempre detener loader
    }
  }

  //Controla si se muestra el modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <Package size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Registrar Mantenimiento</h2>
          </div>
          <button onClick={handleCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">

          {/* Mostrar error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">

            {/* Columna 1 */}
            <div className="space-y-4">

              {/* Buscador de activo */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Activo *</label>
                {activoSeleccionado ? (
                  <div className="flex items-center justify-between px-4 py-2 border border-orange-300 bg-orange-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-orange-700">{activoSeleccionado.nombre}</p>
                      <p className="text-xs text-orange-500">{activoSeleccionado.numero_serie} · {activoSeleccionado.categoria}</p>
                    </div>
                    <button
                      onClick={() => { setActivoSeleccionado(null); setBusquedaActivo(""); }}
                      className="text-orange-400 hover:text-orange-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar activo por nombre o serie..."
                        value={busquedaActivo}
                        onChange={(e) => setBusquedaActivo(e.target.value)}
                        onFocus={() => busquedaActivo.length >= 2 && setMostrarSugerenciasActivo(true)}
                        onBlur={() => setTimeout(() => setMostrarSugerenciasActivo(false), 150)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      />
                    </div>
                    {mostrarSugerenciasActivo && activos.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {activos.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => { setActivoSeleccionado(a); setBusquedaActivo(""); setMostrarSugerenciasActivo(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-800">{a.nombre}</p>
                            <p className="text-xs text-gray-500">{a.numero_serie} · {a.categoria}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Tipo de mantenimiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Tipo *</label>
                <div className="relative">
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white text-sm cursor-pointer"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="revision_general">Revisión General</option>
                    <option value="revision_de_software">Revisión de Software</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {/* Responsable */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Responsable *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Nombre del técnico responsable"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
              </div>

            </div>

            {/* Columna 2 */}
            <div className="space-y-4">

              {/* Fecha programada */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Fecha Programada *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Estado *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["programado", "en_proceso", "pendiente", "pendiente_de_respuesta", "vencido", "finalizado"].map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setEstado(e)}
                      className={`py-1.5 text-[10px] font-bold border-2 rounded-lg transition-colors ${
                        estado === e
                          ? e === "programado"? "border-purple-500 bg-purple-50 text-purple-700"
                          : e === "en_proceso"? "border-blue-500 bg-blue-50 text-blue-700"
                          : e === "pendiente"? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : e === "pendiente_de_respuesta"? "border-orange-500 bg-orange-50 text-orange-700"
                          : e === "vencido"? "border-red-500 bg-red-50 text-red-700"
                          : e === "finalizado"? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-100 bg-white text-gray-400"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {e === "programado"             ? "Programado"
                      : e === "en_proceso"             ? "En Proceso"
                      : e === "pendiente"              ? "Pendiente"
                      : e === "pendiente_de_respuesta" ? "Pend. Respuesta"
                      : e === "vencido"                ? "Vencido"
                      : "Finalizado"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Descripción *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                  <textarea
                    placeholder="Describe el mantenimiento a realizar..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleCerrar}
            className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando}
            className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-60"
          >
            {cargando ? "Guardando..." : "Registrar Mantenimiento"}
          </button>
        </div>
      </div>
    </div>
  );
};