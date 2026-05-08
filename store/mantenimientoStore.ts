import { create } from "zustand";

// Definir el tipo para el store de mantenimiento
type MantenimientoStore = {
  actualizar: number;
  refrescar: () => void;
};

// Crear el store de mantenimiento usando Zustand
export const useMantenimientoStore = create<MantenimientoStore>((set) => ({
  actualizar: 0,
  refrescar: () => set((state) => ({ actualizar: state.actualizar + 1 })),
}));