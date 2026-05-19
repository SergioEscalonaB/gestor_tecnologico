import { Package } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Resumen general de activos tecnológicos
        </p>
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-4 gap-4"> 
        {/* Total Activos */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total Activos
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                1
              </h3>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-100">
              <Package size={18} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Equipos registrados
            </span>
          </div>
        </div>

        {/* En uso */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                En uso
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                2
              </h3>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-100">
              <Package size={18} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Equipos en uso
            </span>
          </div>
        </div>

        {/* En mantenimiento */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                En mantenimiento
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                3
              </h3>
            </div>

            <div className="p-2.5 rounded-xl bg-orange-100">
              <Package size={18} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Equipos en mantenimiento
            </span>
          </div>
        </div>

        {/* Disponibles */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Disponibles
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                4
              </h3>
            </div>

            <div className="p-2.5 rounded-xl bg-green-100">
              <Package size={18} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Equipos disponibles
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}