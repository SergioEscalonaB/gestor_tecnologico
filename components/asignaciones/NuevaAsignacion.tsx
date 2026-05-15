"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Search,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useActivoStore } from "@/store/activoStore";

interface NuevaAsignacionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaAsignacion = ({ isOpen, onClose }: NuevaAsignacionProps) => {
  const refrescar = useActivoStore((state) => state.refrescar);

  // Estados para Activo
  const [busquedaActivo, setBusquedaActivo] = useState("");
  const [activos, setActivos] = useState<any[]>([]);
  const [activoSel, setActivoSel] = useState<any | null>(null);
  const [showActivos, setShowActivos] = useState(false);

  // Estados para Empleado
  const [busquedaEmp, setBusquedaEmp] = useState("");
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [empSel, setEmpSel] = useState<any | null>(null);
  const [showEmps, setShowEmps] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Buscar Activos Disponibles
  useEffect(() => {
    if (busquedaActivo.length < 1) {
        setActivos([]);
        return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/activos?estado=disponible`)
        .then((res) => res.json())
        .then((data) => {
          const filtrados = data.filter((a: any) =>
            a.nombre.toLowerCase().includes(busquedaActivo.toLowerCase()) ||
            a.numero_serie.toLowerCase().includes(busquedaActivo.toLowerCase())
          );
          setActivos(filtrados);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaActivo]);

  // Buscar Empleados Activos
  useEffect(() => {
    if (busquedaEmp.length < 1) {
        setEmpleados([]);
        return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/empleados?solo_activos=true`)
        .then((res) => res.json())
        .then((data) => {
          const filtrados = data.filter((e: any) =>
            e.nombre.toLowerCase().includes(busquedaEmp.toLowerCase()) ||
            e.cedula.toString().includes(busquedaEmp)
          );
          setEmpleados(filtrados);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaEmp]);

  const handleGuardar = async () => {
    if (!activoSel || !empSel) {
      setError("Debes seleccionar un activo y un empleado.");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activoId: activoSel.id,
          empleadoId: empSel.id,
        }),
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al crear la asignación");
      }

      refrescar();
      handleCerrar();
    } catch (err: any) {
      setError(err.message || "No se pudo procesar la asignación.");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nueva Asignación</h2>
              <p className="text-sm text-gray-500">Vincula un equipo a un responsable</p>
            </div>
          </div>
          <button onClick={handleCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Selector de Activo */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1">Seleccionar Activo (Disponible)</label>
            {activoSel ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">{activoSel.nombre}</p>
                    <p className="text-xs text-blue-600 font-medium">{activoSel.numero_serie} • {activoSel.categoria}</p>
                  </div>
                </div>
                <button onClick={() => setActivoSel(null)} className="p-2 hover:bg-blue-100 rounded-full text-blue-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar equipo por nombre o serie..."
                  value={busquedaActivo}
                  onChange={(e) => { setBusquedaActivo(e.target.value); setShowActivos(true); }}
                  onFocus={() => setShowActivos(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
                {showActivos && activos.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                    {activos.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setActivoSel(a); setShowActivos(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl text-left transition-colors"
                      >
                        <Package className="text-gray-400" size={18} />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{a.nombre}</p>
                          <p className="text-xs text-gray-500">{a.numero_serie} - {a.marca}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selector de Empleado */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1">Seleccionar Empleado</label>
            {empSel ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-xl text-green-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-green-900">{empSel.nombre}</p>
                    <p className="text-xs text-green-600 font-medium">{empSel.cargo} • {empSel.area}</p>
                  </div>
                </div>
                <button onClick={() => setEmpSel(null)} className="p-2 hover:bg-green-100 rounded-full text-green-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar empleado por nombre o cédula..."
                  value={busquedaEmp}
                  onChange={(e) => { setBusquedaEmp(e.target.value); setShowEmps(true); }}
                  onFocus={() => setShowEmps(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                />
                {showEmps && empleados.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                    {empleados.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => { setEmpSel(e); setShowEmps(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl text-left transition-colors"
                      >
                        <User className="text-gray-400" size={18} />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{e.nombre}</p>
                          <p className="text-xs text-gray-500">{e.cargo} - {e.area}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
          <button
            onClick={handleCerrar}
            className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando || !activoSel || !empSel}
            className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {cargando ? "Procesando..." : (
              <>
                <CheckCircle2 size={20} />
                <span>Confirmar Asignación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
