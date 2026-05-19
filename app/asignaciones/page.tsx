import { Suspense } from "react";
import { AsignacionesContent } from "@/components/asignaciones/AsignacionesContent";

export default function AsignacionesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-gray-500">
          Cargando asignaciones...
        </div>
      }
    >
      <AsignacionesContent />
    </Suspense>
  );
}
