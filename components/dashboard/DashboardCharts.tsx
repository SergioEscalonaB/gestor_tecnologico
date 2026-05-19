import type { ReactElement } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

type ResumenCategoria = {
  categoria: string;
  cantidad: number;
  porcentaje: number;
};

type ResumenEstado = {
  estado: string;
  cantidad: number;
};

type PropsGraficasPanel = {
  resumenCategorias: ResumenCategoria[];
  resumenEstados: ResumenEstado[];
  totalActivos: number;
  maximoEstado: number;
  totalPastel: number;
  coloresPastel: string[];
  coloresEstados: string[];
};

export function GraficasDelPanel({
  resumenCategorias,
  resumenEstados,
  totalActivos,
  maximoEstado,
  totalPastel,
  coloresPastel,
  coloresEstados,
}: PropsGraficasPanel) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Activos por categoría
            </h3>
            <p className="text-sm text-gray-500">
              Distribución tomada de la base de datos.
            </p>
          </div>
          <BarChart3 size={18} className="text-blue-600" />
        </div>

        {resumenCategorias.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
            No hay datos de categorías para mostrar.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[180px_1fr] lg:items-center">
            <div className="mx-auto flex h-44 w-44 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                {
                  resumenCategorias.reduce<{
                    offset: number;
                    nodes: ReactElement[];
                  }>(
                    (acumulador, item, index) => {
                      const longitud =
                        (item.cantidad / totalPastel) * 289.02652413026095;
                      const nodo = (
                        <circle
                          key={item.categoria}
                          cx="60"
                          cy="60"
                          r="46"
                          fill="none"
                          stroke={coloresPastel[index % coloresPastel.length]}
                          strokeWidth="16"
                          strokeDasharray={`${longitud} 289.02652413026095`}
                          strokeDashoffset={-acumulador.offset}
                          strokeLinecap="round"
                        />
                      );

                      acumulador.offset += longitud;
                      acumulador.nodes.push(nodo);
                      return acumulador;
                    },
                    { offset: 0, nodes: [] },
                  ).nodes
                }
                <circle cx="60" cy="60" r="28" fill="#ffffff" />
                <text
                  x="60"
                  y="56"
                  textAnchor="middle"
                  className="fill-gray-900 text-[20px] font-bold"
                  transform="rotate(90 60 60)"
                >
                  {totalActivos}
                </text>
                <text
                  x="60"
                  y="70"
                  textAnchor="middle"
                  className="fill-gray-500 text-[8px] uppercase tracking-[0.2em]"
                  transform="rotate(90 60 60)"
                >
                  Total
                </text>
              </svg>
            </div>

            <div className="space-y-3">
              {resumenCategorias.map((item, index) => (
                <div
                  key={item.categoria}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          coloresPastel[index % coloresPastel.length],
                      }}
                    />
                    <span className="truncate text-sm font-medium text-gray-700">
                      {item.categoria}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm text-gray-500">
                    {item.cantidad} · {item.porcentaje}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Activos por estado
            </h3>
            <p className="text-sm text-gray-500">
              Conteo de estados actuales del inventario.
            </p>
          </div>
          <TrendingUp size={18} className="text-emerald-600" />
        </div>

        {resumenEstados.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
            No hay estados disponibles.
          </div>
        ) : (
          <div className="grid h-64 grid-cols-4 items-end gap-3 rounded-xl bg-gray-50 px-4 pb-4 pt-6">
            {resumenEstados.slice(0, 4).map((item, index) => {
              const altura = `${Math.max((item.cantidad / maximoEstado) * 100, item.cantidad > 0 ? 14 : 0)}%`;

              return (
                <div
                  key={item.estado}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className="flex w-full max-w-20 items-end justify-center rounded-t-xl px-2 pb-2 text-xs font-semibold text-white shadow-sm transition-all"
                      style={{
                        height: altura,
                        minHeight: item.cantidad > 0 ? "3rem" : "0",
                        backgroundColor:
                          coloresEstados[index % coloresEstados.length],
                      }}
                    >
                      {item.cantidad}
                    </div>
                  </div>
                  <div className="text-center text-xs font-medium text-gray-600">
                    {item.estado}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
