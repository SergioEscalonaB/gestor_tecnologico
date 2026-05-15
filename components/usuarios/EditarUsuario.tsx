"use client";

import { useState, useEffect } from "react";
import { User, Mail, Briefcase, MapPin, Hash } from "lucide-react";
import { Empleado } from "@/tipos/empleado";

export function EditarUsuario({
  empleado,
  onGuardado,
}: {
  empleado: Empleado;
  onGuardado: (actualizado: Empleado) => void;
}) {
  const [cedula, setCedula] = useState(String(empleado.cedula));
  const [nombre, setNombre] = useState(empleado.nombre);
  const [correo, setCorreo] = useState(empleado.correo_electronico);
  const [cargo, setCargo] = useState(empleado.cargo);
  const [area, setArea] = useState(empleado.area);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleGuardar() {
    if (!cedula || !nombre || !correo || !cargo || !area) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    const res = await fetch(`/api/empleados/${empleado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        correo_electronico: correo,
        cargo,
        area,
      }),
    });

    if (res.ok) {
      const actualizado = await res.json();
      onGuardado(actualizado);
    } else {
      let mensaje = "Error al guardar los cambios";
      try {
        const data = await res.json();
        mensaje = data.error ?? mensaje;
      } catch { /* sin JSON */ }
      setError(mensaje);
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

      <div className="grid grid-cols-2 gap-3">

        {/* Cédula */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Cédula (No editable)</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
            <input
              type="text"
              value={cedula}
              readOnly
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Nombre */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Correo */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cargo */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Cargo *</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Área */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Área *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Botón desactivar — solo si el empleado está activo */}
      {empleado.activo && (
        <button
          onClick={async () => {
            if (!confirm(`¿Seguro que deseas desactivar a ${empleado.nombre}?`)) return;

            const res = await fetch(`/api/empleados/${empleado.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({ activo: false }),
            });

            if (res.ok) {
              const actualizado = await res.json();
              onGuardado(actualizado);
            }
          }}
          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors"
        >
          Desactivar usuario
        </button>
      )}

      {/* Botón reactivar — solo si el empleado está inactivo */}
      {!empleado.activo && (
        <button
          onClick={async () => {
            if (!confirm(`¿Seguro que deseas reactivar a ${empleado.nombre}?`)) return;

            const res = await fetch(`/api/empleados/${empleado.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ activo: true }),
            });

            if (res.ok) {
              const actualizado = await res.json();
              onGuardado(actualizado);
            }
          }}
          className="w-full py-2 inline-flex items-center justify-center gap-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200 hover:bg-green-200 transition-colors"
        >
          Reactivar usuario
        </button>
      )}

      {/* Botón guardar */}
      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>   
    </div>
  );
}