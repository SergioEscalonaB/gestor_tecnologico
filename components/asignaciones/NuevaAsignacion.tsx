"use client";

import { useState, useEffect } from "react";
import { X, Search, Package, User, Calendar, Check } from "lucide-react";
import { useActivoStore } from "@/store/activoStore";

interface NuevaAsignacionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaAsignacion = ({ isOpen, onClose }: NuevaAsignacionProps) => {
  const refrescar = useActivoStore((state) => state.refrescar);

  const [busquedaActivo, setBusquedaActivo] = useState("");
  const [activos, setActivos] = useState<any[]>([]);
  const [activoSel, setActivoSel] = useState<any | null>(null);
  const [showActivos, setShowActivos] = useState(false);

  const [busquedaEmp, setBusquedaEmp] = useState("");
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [empSel, setEmpSel] = useState<any | null>(null);
  const [showEmps, setShowEmps] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cargar activos de la API
  useEffect(() => {
    if (busquedaActivo.length < 2) { setActivos([]); return; }
    const delayDebounceFn = setTimeout(() => {
        fetch(`/api/activos`)
          .then(res => res.json())
          .then(data => {
            const filtrados = data.filter((a: any) =>
              a.nombre.toLowerCase().includes(busquedaActivo.toLowerCase()) ||
              a.numero_serie.toLowerCase().includes(busquedaActivo.toLowerCase())
            );
            setActivos(filtrados);
          });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busquedaActivo]);

  //Colores de los estados de los activos
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-600';
      case 'en_uso': return 'bg-blue-100 text-blue-600';
      case 'mantenimiento': return 'bg-orange-100 text-orange-600';
      case 'dado_baja': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Estados de los activos
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'en_uso': return 'En Uso';
      case 'mantenimiento': return 'Mantenimiento';
      case 'dado_baja': return 'Baja';
      default: return estado;
    }
  };

  // Cargar empleados de la API
  useEffect(() => {
    if (busquedaEmp.length < 2) { setEmpleados([]); return; }
    const delayDebounceFn = setTimeout(() => {
        fetch(`/api/empleados?solo_activos=true`)
          .then(res => res.json())
          .then(data => {
            const filtrados = data.filter((e: any) =>
              e.nombre.toLowerCase().includes(busquedaEmp.toLowerCase()) ||
              e.cedula.toString().includes(busquedaEmp)
            );
            setEmpleados(filtrados);
          });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busquedaEmp]);

  // Guardar asignación
  const handleGuardar = async () => {
    if (!activoSel || !empSel) {
      setError("Selecciona un activo y un empleado.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activoId: activoSel.id, empleadoId: empSel.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        let mensaje = data.error || "Error";
        // Traducir estados a nombres para mostrarlos 
        mensaje = mensaje
          .replace("en_uso", "En Uso")
          .replace("mantenimiento", "Mantenimiento")
          .replace("dado_baja", "Dado de Baja");
          
        throw new Error(mensaje);
      }
      
      refrescar();
      handleCerrar();
    } catch (err: any) {
      setError(err.message || "Error al procesar la asignación.");
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    setActivoSel(null);
    setEmpSel(null);
    setBusquedaActivo("");
    setBusquedaEmp("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="bg-white max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <Calendar size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Nueva Asignación</h2>
          </div>
          <button onClick={handleCerrar} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">{error}</div>}

          {/* Selector Activo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Equipo a asignar *</label>
            {activoSel ? (
              <div className="flex items-center justify-between px-4 py-3 border border-blue-200 bg-blue-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                    <Package size={16} className="text-blue-600" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900">{activoSel.nombre}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-blue-400">({activoSel.numero_serie})</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${getEstadoColor(activoSel.estado)}`}>
                                {getEstadoLabel(activoSel.estado)}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setActivoSel(null)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o número de serie..."
                  value={busquedaActivo}
                  onChange={(e) => { setBusquedaActivo(e.target.value); setShowActivos(true); }}
                  onFocus={() => setShowActivos(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                />
                {showActivos && activos.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {activos.map(a => (
                      <button key={a.id} onClick={() => { setActivoSel(a); setShowActivos(false); }} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{a.nombre}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{a.numero_serie}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getEstadoColor(a.estado)}`}>
                            {getEstadoLabel(a.estado)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selector Empleado */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Empleado Responsable *</label>
            {empSel ? (
              <div className="flex items-center justify-between px-4 py-3 border border-green-200 bg-green-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                    <User size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-900">{empSel.nombre} <span className="text-green-400 font-normal">({empSel.cargo})</span></span>
                </div>
                <button onClick={() => setEmpSel(null)} className="text-green-400 hover:text-green-600"><X size={16} /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula..."
                  value={busquedaEmp}
                  onChange={(e) => { setBusquedaEmp(e.target.value); setShowEmps(true); }}
                  onFocus={() => setShowEmps(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                />
                {showEmps && empleados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {empleados.map(e => (
                      <button key={e.id} onClick={() => { setEmpSel(e); setShowEmps(false); }} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0 transition-colors">
                        <p className="font-semibold text-gray-800">{e.nombre}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{e.cargo} • {e.area}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer*/}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3">
          <button 
            onClick={handleCerrar} 
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando || !activoSel || !empSel}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {cargando ? "Guardando..." : "Confirmar Asignación"}
          </button>
        </div>
      </div>
    </div>
  );
};
