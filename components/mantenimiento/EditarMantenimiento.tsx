"use client";

import { useState } from "react";
import { User, Calendar, FileText, ChevronDown } from "lucide-react";

import { Mantenimiento } from "@/tipos/mantenimiento";

// Componente para editar mantenimiento
export function EditarMantenimiento({
  mantenimiento,
  onGuardado,
}: {
  mantenimiento: Mantenimiento;
  onGuardado: (actualizado: Mantenimiento) => void;
}) {
  const [tipo, setTipo]           = useState(mantenimiento.tipo);
  const [descripcion, setDescripcion] = useState(mantenimiento.descripcion);
  const [fechaProgramada, setFechaProgramada] = useState(
    // Convierte a formato yyyy-MM-dd para el input date
    new Date(mantenimiento.fecha_programada).toISOString().split("T")[0]);
  const [responsable, setResponsable] = useState(mantenimiento.responsable);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState("");

  // Boton guardar mantenimiento
  async function handleGuardar() {
    if (!tipo || !descripcion || !fechaProgramada || !responsable) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    // Actualiza el mantenimiento en la API
    const res = await fetch(`/api/mantenimientos/${mantenimiento.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        descripcion,
        fecha_programada: fechaProgramada,
        responsable,
        estado: mantenimiento.estado, // el estado no cambia aquí
      }),
    });

    if (res.ok) {
      const actualizado = await res.json();
      // Mantiene los datos del activo que no vienen en la respuesta
      onGuardado({ ...actualizado, activo: mantenimiento.activo });
    } else {
      setError("Error al guardar los cambios");
    }

    setGuardando(false);
  }

  return (
    <div className="space-y-3">

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Tipo */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
        <div className="relative">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="revision_general">Revisión General</option>
            <option value="revision_de_software">Revisión de Software</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Responsable */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase">Responsable</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fecha programada */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase">Fecha Programada</label>
        <div className="relative">
          <input
            type="date"
            value={fechaProgramada}
            onChange={(e) => setFechaProgramada(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Botón guardar */}
      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}