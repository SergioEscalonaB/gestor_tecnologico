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
        {/* Filtro de fecha*/}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="fecha-inicio" className="text-sm font-medium text-gray-700">
            Fecha inicio:
          </label>
          <input
            type="date"
            id="fecha-inicio"
            className="border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="fecha-fin" className="text-sm font-medium text-gray-700">
            Fecha final:
          </label>
          <input
            type="date"
            id="fecha-fin"
            className="border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

      {/* Gráficas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gráfica de activos por categoría */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activos por categoría
          </h3>
          {/* Aquí va la gráfica */}
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Gráfica de pastel</span>
          </div>
        </div>

        {/* Gráfica de activos por estado */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activos por estado
          </h3>
          {/* Aquí va la gráfica */}
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Gráfica de barras</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Tabla de próximos mantenimientos */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos mantenimientos
          </h3>
          {/* Aquí va la tabla */}
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Tabla de mantenimientos</span>
          </div>
        </div>

        {/* Tabla de activos más recientes */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activos más recientes
          </h3>
          {/* Aquí va la tabla */}
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Tabla de activos</span>
          </div>
        </div>
      </div>


      
    </div>
  );
}