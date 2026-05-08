import { useState } from "react";

type Mantenimiento = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: string;
  responsable: string;
  estado: string;
  activo?: {
    id: number;
    nombre: string;
    categoria: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    ubicacion: string;
    estado: string;
  };
};

export function CambiarEstado({
  mantenimiento,
  onActualizado,
}: {
  mantenimiento: Mantenimiento;
  onActualizado: (nuevoEstado: string) => void;
}) {
  const [nuevoEstado, setNuevoEstado] = useState(mantenimiento.estado);
  const [guardando, setGuardando]     = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    const res = await fetch(`/api/mantenimientos/${mantenimiento.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo:             mantenimiento.tipo,
        descripcion:      mantenimiento.descripcion,
        fecha_programada: mantenimiento.fecha_programada,
        responsable:      mantenimiento.responsable,
        estado:           nuevoEstado,
      }),
    });

    if (res.ok) {
      onActualizado(nuevoEstado);
    }
    setGuardando(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Botones de estado */}
      <div className="grid grid-cols-2 gap-2">
        {["programado", "en_proceso", "pendiente", "pendiente_de_respuesta", "vencido", "finalizado"].map((e) => (
          <button
            key={e}
            onClick={() => setNuevoEstado(e)}
            className={`py-1.5 text-[10px] font-bold border-2 rounded-lg transition-colors ${
              nuevoEstado === e
                ? e === "programado"             ? "border-purple-500 bg-purple-50 text-purple-700"
                : e === "en_proceso"             ? "border-blue-500 bg-blue-50 text-blue-700"
                : e === "pendiente"              ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                : e === "pendiente_de_respuesta" ? "border-orange-500 bg-orange-50 text-orange-700"
                : e === "vencido"                ? "border-red-500 bg-red-50 text-red-700"
                : "border-green-500 bg-green-50 text-green-700"
                : "border-gray-100 bg-white text-gray-400"
            }`}
          >
            {e === "programado"             ? "Programado"
            : e === "en_proceso"            ? "En Proceso"
            : e === "pendiente"             ? "Pendiente"
            : e === "pendiente_de_respuesta"? "Pend. Respuesta"
            : e === "vencido"               ? "Vencido"
            : "Finalizado"}
          </button>
        ))}
      </div>

      {/* Botón guardar — solo aparece si el estado cambió */}
      {nuevoEstado !== mantenimiento.estado && (
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar cambio de estado"}
        </button>
      )}
    </div>
  );
}