import { CalendarDays } from "lucide-react";

type ResponsableActivo = {
  id: number;
  nombre: string;
} | null;

type ResumenActivo = {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  ubicacion: string | null;
  fecha_compra: string;
  empleadoResponsable: ResponsableActivo;
};

type PropsActivosRecientes = {
  activosRecientes: ResumenActivo[];
  cargandoDatos: boolean;
  formatearFecha: (value: string) => string;
  clasesEtiquetaEstado: (estado: string) => string;
  etiquetaEstado: (estado: string) => string;
};

export function ActivosRecientesPanel({
  activosRecientes,
  cargandoDatos,
  formatearFecha,
  clasesEtiquetaEstado,
  etiquetaEstado,
}: PropsActivosRecientes) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Activos más recientes
          </h3>
          <p className="text-sm text-gray-500">
            Altas más recientes registradas en el sistema.
          </p>
        </div>
        <CalendarDays size={18} className="text-blue-600" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Activo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Compra
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {cargandoDatos ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>
                  Cargando activos...
                </td>
              </tr>
            ) : activosRecientes.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>
                  No hay activos recientes para mostrar.
                </td>
              </tr>
            ) : (
              activosRecientes.map((activo) => (
                <tr key={activo.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {activo.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activo.categoria}
                      {activo.empleadoResponsable
                        ? ` · ${activo.empleadoResponsable.nombre}`
                        : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${clasesEtiquetaEstado(activo.estado)}`}
                    >
                      {etiquetaEstado(activo.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatearFecha(activo.fecha_compra)}
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
