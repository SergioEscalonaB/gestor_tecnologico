"use client"

import { useState } from "react";

import {
  X, User, Mail, Briefcase, MapPin
} from "lucide-react";
import { useUsuarioStore } from "@/store/usuarioStore";
import { Empleado } from "@/tipos/empleado";

// Props del componente
interface NuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoUsuario = ({isOpen, onClose}: NuevoUsuarioProps) => {
    const refrescar = useUsuarioStore(state => state.refrescar);
    
    // Campos del formulario
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [cargo, setCargo] = useState('');
    const [area, setArea] = useState('');

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    // Limpiar el formulario
    function limpiarFormulario(){
        setNombre('');
        setCorreo('');
        setCargo('');
        setArea('');
        setError('');
    }

    // Cierra el formulario
    function handleCerrar(){
        limpiarFormulario();
        onClose();
    }

    // Guardar al usuario
    async function handleGuardar(){
        if(!nombre || !correo || !cargo || !area) {
            setError("Por favor complete todos los campos");
            return;
        }
        
        setCargando(true);
        setError("")
        try {
            // Envia el nuevo usuario al api
            const res = await fetch("/api/empleados", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    correo_electronico: correo,
                    cargo,
                    area
                })
            });
            // Maneja respuesta
            if (!res.ok){
                let mensaje = "Error al guardar el usuario"
                try{
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
        } catch(error) {
            setError("No se pudo conectar con el servidor")
        } finally{
            setCargando(false); // Siempre detener Loader
        }
    }

    // Controla si se muestra el modal
    if(!isOpen) return null;

    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Registrar Nuevo Usuario</h2>
          </div>
          <button onClick={handleCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="px-8 py-10">

          {/* Mostrar error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

            {/* Columna 1 */}
            <div className="space-y-6">

              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Nombre Completo *</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Correo Electrónico *</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="ejemplo@empresa.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Columna 2 */}
            <div className="space-y-6">

              {/* Cargo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Cargo / Puesto *</label>
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Ej. Analista de Sistemas"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Área / Departamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Área / Departamento *</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Ej. Tecnología"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all"
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
            className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              "Registrar Usuario"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};



