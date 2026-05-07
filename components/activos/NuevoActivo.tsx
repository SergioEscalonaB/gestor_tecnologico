"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Hash,
  DollarSign,
  MapPin,
  Calendar,
  Search,
  ChevronDown,
  Tag,
  Package,
} from "lucide-react";
import { useActivoStore } from "@/store/activoStore";

// Tipo simple para el empleado en el buscador
type EmpleadoSimple = {
  id: number;
  nombre: string;
  cargo: string;
};

interface NuevoActivoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoActivo = ({ isOpen, onClose }: NuevoActivoProps) => {
  const refrescar = useActivoStore((state) => state.refrescar);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [valorCompra, setValorCompra] = useState("");
  const [proveedor, setProveedor] = useState("");

  // Buscador de empleado responsable
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [empleados, setEmpleados] = useState<EmpleadoSimple[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<EmpleadoSimple | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Busca empleados mientras escribe
  useEffect(() => {
    if (busquedaEmpleado.length < 2) {
      setEmpleados([]);
      return;
    }
    fetch("/api/empleados")
      .then((res) => res.json())
      .then((data: EmpleadoSimple[]) => {
        const filtrados = data.filter((e) =>
          e.nombre.toLowerCase().includes(busquedaEmpleado.toLowerCase()),
        );
        setEmpleados(filtrados);
        setMostrarSugerencias(true);
      });
  }, [busquedaEmpleado]);

  // Limpia el formulario
  function limpiarFormulario() {
    setNombre("");
    setCategoria("");
    setMarca("");
    setModelo("");
    setNumeroSerie("");
    setEstado("disponible");
    setUbicacion("");
    setFechaCompra("");
    setValorCompra("");
    setProveedor("");
    setBusquedaEmpleado("");
    setEmpleadoSeleccionado(null);
    setError("");
  }

  // Cierra el formulario
  function handleCerrar() {
    limpiarFormulario();
    onClose();
  }

  // Guarda el activo
  async function handleGuardar() {
    // Validación de campos obligatorios
    if (
      !nombre ||
      !categoria ||
      !marca ||
      !modelo ||
      !numeroSerie ||
      !fechaCompra
    ) {
      setError(
        "Nombre, categoría, marca, modelo, número de serie y fecha de compra son obligatorios.",
      );
      return;
    }
    setCargando(true);
    setError("");

    try {
      // Envía el nuevo activo al backend
      const res = await fetch("/api/activos/nuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          categoria,
          marca,
          modelo,
          numero_serie: numeroSerie,
          estado,
          ubicacion: ubicacion || null,
          fecha_compra: fechaCompra,
          valor_compra: valorCompra ? parseFloat(valorCompra) : null,
          proveedor: proveedor || null,
          empleadoResponsableId: empleadoSeleccionado?.id ?? null,
        }),
      });

      if (!res.ok) {
        let mensaje = "Error al guardar el activo";
        try {
          const data = await res.json();
          mensaje = data.error ?? mensaje;
        } catch {
          // Si no viene JSON, mantenemos un mensaje generico
        }
        setError(mensaje);
        return;
      }

      refrescar(); // avisa a la lista que recargue
      handleCerrar(); // cierra el formulario
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false); // siempre detener loader
    }
  }

  // Controla si se muestra el modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Package size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Registrar Nuevo Activo
            </h2>
          </div>
          <button
            onClick={handleCerrar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr] gap-x-10 gap-y-6">
            {/* Columna 1 — Valor y proveedor */}
            <div className="space-y-4">
              {/* Valor de compra */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Valor de Compra
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={valorCompra}
                    onChange={(e) => setValorCompra(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-600"
                  />
                </div>
              </div>

              {/* Proveedor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Ej: TechStore SAS"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Columna 2 — Detalles */}
            <div className="space-y-4">
              {/* Nombre del activo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Nombre del Activo *
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Ej: Laptop Dell Latitude"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Número de serie */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Número de Serie *
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="SN-XXXXX-XXXX"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Modelo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Modelo *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Ej: E5440"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Oficina / Piso / Bodega"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Columna 3 — Selectores */}
            <div className="space-y-4">
              {/* Categoría */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Categoría *
                </label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm cursor-pointer"
                  >
                    <option value="">Seleccionar Categoría</option>
                    <option value="computador">Computador</option>
                    <option value="celular">Celular</option>
                    <option value="impresora">Impresora</option>
                    <option value="red">Red</option>
                    <option value="monitor">Monitor</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Buscador de empleado responsable */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Responsable
                </label>
                {empleadoSeleccionado ? (
                  // Muestra el empleado seleccionado con opción de quitar
                  <div className="flex items-center justify-between px-4 py-2 border border-blue-300 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        {empleadoSeleccionado.nombre}
                      </p>
                      <p className="text-xs text-blue-500">
                        {empleadoSeleccionado.cargo}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEmpleadoSeleccionado(null);
                        setBusquedaEmpleado("");
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Buscar empleado..."
                        value={busquedaEmpleado}
                        onChange={(e) => setBusquedaEmpleado(e.target.value)}
                        onFocus={() =>
                          busquedaEmpleado.length >= 2 &&
                          setMostrarSugerencias(true)
                        }
                        onBlur={() =>
                          setTimeout(() => setMostrarSugerencias(false), 150)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    {/* Sugerencias */}
                    {mostrarSugerencias && empleados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {empleados.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => {
                              setEmpleadoSeleccionado(e);
                              setBusquedaEmpleado("");
                              setMostrarSugerencias(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-800">
                              {e.nombre}
                            </p>
                            <p className="text-xs text-gray-500">{e.cargo}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Estado *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["disponible", "en_uso", "mantenimiento", "dado_baja"].map(
                    (e) => (
                      <button
                        key={e}
                        onClick={() => setEstado(e)}
                        className={`py-1.5 text-[10px] font-bold border-2 rounded-lg transition-colors ${
                          estado === e
                            ? e === "disponible"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : e === "en_uso"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : e === "mantenimiento"
                                  ? "border-orange-500 bg-orange-50 text-orange-700"
                                  : "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-100 bg-white text-gray-400"
                        }`}
                      >
                        {e === "disponible"
                          ? "Disponible"
                          : e === "en_uso"
                            ? "En Uso"
                            : e === "mantenimiento"
                              ? "Mantenimiento"
                              : "Dado de Baja"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha de compra */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                    Fecha Compra *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fechaCompra}
                      onChange={(e) => setFechaCompra(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-xs"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                </div>

                {/* Marca */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                    Marca *
                  </label>
                  <select
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-xs bg-white appearance-none"
                  >
                    <option value="">Seleccionar</option>
                    <option value="HP">HP</option>
                    <option value="Dell">Dell</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Cisco">Cisco</option>
                    <option value="LG">LG</option>
                    <option value="Otro">Otro</option>
                  </select>
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
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-60"
          >
            {cargando ? "Guardando..." : "Guardar Activo"}
          </button>
        </div>
      </div>
    </div>
  );
};
