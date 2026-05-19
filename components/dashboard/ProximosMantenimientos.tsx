import { Clock3 } from "lucide-react";

type ResumenMantenimiento = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: string;
  responsable: string;
  estado: string;
  fecha_finalizacion: string | null;
  activo: {
    id: number;
    nombre: string;
    categoria: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    ubicacion: string | null;
    estado: string;
  } | null;
};

type PropsMantenimientosProximos = {
  mantenimientosProximos: ResumenMantenimiento[];
  cargandoDatos: boolean;
  formatearFecha: (value: string) => string;
  clasesEtiquetaMantenimiento: (estado: string) => string;
  etiquetaEstado: (estado: string) => string;
};

export function MantenimientosProximosPanel({
  mantenimientosProximos,
  cargandoDatos,
  formatearFecha,
  clasesEtiquetaMantenimiento,
  etiquetaEstado,
}: PropsMantenimientosProximos) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md xl:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Próximos mantenimientos
          </h3>
          <p className="text-sm text-gray-500">
            Registros ordenados por fecha programada.
          </p>
        </div>
        <Clock3 size={18} className="text-amber-600" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Equipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Responsable
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {cargandoDatos ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                  Cargando mantenimientos...
                </td>
              </tr>
            ) : mantenimientosProximos.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                  No hay mantenimientos para mostrar.
                </td>
              </tr>
            ) : (
              mantenimientosProximos.map((mantenimiento) => (
                <tr key={mantenimiento.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {mantenimiento.activo?.nombre ||
                        mantenimiento.activo_nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {mantenimiento.activo?.marca || ""}
                      {mantenimiento.activo?.modelo
                        ? ` · ${mantenimiento.activo.modelo}`
                        : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {mantenimiento.tipo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatearFecha(mantenimiento.fecha_programada)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {mantenimiento.responsable}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${clasesEtiquetaMantenimiento(mantenimiento.estado)}`}
                    >
                      {etiquetaEstado(mantenimiento.estado)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
