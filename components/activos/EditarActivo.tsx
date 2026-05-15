"use client";

import { useState, useEffect } from "react";
import { User, Search, X, ChevronDown, MapPin, Hash, Tag } from "lucide-react";
import { Activo } from "@/tipos/activo";
import { useActivoStore } from "@/store/activoStore";

type EmpleadoSimple = {
  id: number;
  nombre: string;
  cargo: string;
};

export function EditarActivo({
  activo,
  onGuardado,
}: {
  activo: Activo;
  onGuardado: (actualizado: Activo) => void;
}) {
  const refrescar = useActivoStore((state) => state.refrescar);
  const estaEnMantenimiento = activo.estado === "mantenimiento";

  const [nombre, setNombre] = useState(activo.nombre);
  const [categoria, setCategoria] = useState(activo.categoria);
  const [marca, setMarca] = useState(activo.marca);
  const [modelo, setModelo] = useState(activo.modelo);
  const [ubicacion, setUbicacion] = useState(activo.ubicacion ?? "");
  const [proveedor, setProveedor] = useState(activo.proveedor ?? "");
  const [numeroSerie, setNumeroSerie] = useState(activo.numero_serie);

  // Buscador de empleado responsable
  const [busquedaEmpleado, setBusquedaEmpleado] = useState(activo.empleadoResponsable?.nombre ?? "");
  const [empleados, setEmpleados] = useState<EmpleadoSimple[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoSimple | null>(
    activo.empleadoResponsable ? { id: activo.empleadoResponsable.id, nombre: activo.empleadoResponsable.nombre, cargo: "" } : null
  );
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Busca empleados mientras escribe
  useEffect(() => {
    if (busquedaEmpleado.length < 2) {
      setEmpleados([]);
      return;
    }
    fetch("/api/empleados?solo_activos=true")
      .then((res) => res.json())
      .then((data: EmpleadoSimple[]) => {
        const filtrados = data.filter((e) =>
          e.nombre.toLowerCase().includes(busquedaEmpleado.toLowerCase())
        );
        setEmpleados(filtrados);
        setMostrarSugerencias(true);
      });
  }, [busquedaEmpleado]);

  async function handleGuardar() {
    if (!nombre || !categoria || !marca || !modelo || !numeroSerie) {
      setError("Nombre, categoría, marca, modelo y número de serie son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    // Si el estado actual es mantenimiento o dado de baja, se respeta.
    // De lo contrario, se determina por la presencia de un responsable.
    let nuevoEstado = activo.estado;
    if (activo.estado !== "mantenimiento" && activo.estado !== "dado_baja") {
      nuevoEstado = empleadoSeleccionado ? "en_uso" : "disponible";
    }

    const res = await fetch(`/api/activos/${activo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        marca,
        modelo,
        numero_serie: numeroSerie,
        estado: nuevoEstado,
        ubicacion: ubicacion || null,
        proveedor: proveedor || null,
        fecha_compra: activo.fecha_compra,
        valor_compra: activo.valor_compra,
        empleadoResponsableId: empleadoSeleccionado?.id ?? null,
      }),
    });

    if (res.ok) {
      const actualizado = await res.json();
      refrescar(); // Sincroniza con el historial de asignaciones
      onGuardado({
        ...actualizado,
        empleadoResponsable: empleadoSeleccionado
          ? { id: empleadoSeleccionado.id, nombre: empleadoSeleccionado.nombre }
          : null,
      });
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

      <div className="grid grid-cols-2 gap-3">

        {/* Nombre */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Nombre *</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categoría */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Categoría *</label>
          <div className="relative">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="computador">Computador</option>
              <option value="celular">Celular</option>
              <option value="impresora">Impresora</option>
              <option value="red">Red</option>
              <option value="monitor">Monitor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Marca */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Marca *</label>
          <div className="relative">
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="HP">HP</option>
              <option value="Dell">Dell</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Lenovo">Lenovo</option>
              <option value="Cisco">Cisco</option>
              <option value="LG">LG</option>
              <option value="Otro">Otro</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Modelo */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Modelo *</label>
          <input
            type="text"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Número de serie */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Número de Serie *</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Ubicación</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Oficina / Piso / Bodega"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Proveedor */}
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Proveedor</label>
          <input
            type="text"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            placeholder="Ej: TechStore SAS"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Responsable */}
        <div className="col-span-2 space-y-1 relative">
          <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
            <span>Responsable</span>
            <span className="text-[10px] font-normal text-gray-400 normal-case">
              {estaEnMantenimiento 
                ? "(No editable, en mantenimiento)" 
                : (empleadoSeleccionado ? " estado: En Uso" : " estado: Disponible")}
            </span>
          </label>

          {empleadoSeleccionado ? (
            <div className="flex items-center justify-between px-3 py-2 border border-blue-300 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-blue-700">{empleadoSeleccionado.nombre}</p>
                {empleadoSeleccionado.cargo && (
                  <p className="text-xs text-blue-500">{empleadoSeleccionado.cargo}</p>
                )}
              </div>
              <button
                onClick={() => { setEmpleadoSeleccionado(null); setBusquedaEmpleado(""); }}
                disabled={estaEnMantenimiento}
                className="text-blue-400 hover:text-blue-600 disabled:opacity-30"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar empleado..."
                  value={busquedaEmpleado}
                  disabled={estaEnMantenimiento}
                  onChange={(e) => setBusquedaEmpleado(e.target.value)}
                  onFocus={() => busquedaEmpleado.length >= 2 && setMostrarSugerencias(true)}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              {mostrarSugerencias && empleados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {empleados.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { setEmpleadoSeleccionado(e); setBusquedaEmpleado(""); setMostrarSugerencias(false); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800">{e.nombre}</p>
                      <p className="text-xs text-gray-500">{e.cargo}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>

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