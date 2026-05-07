import { create } from "zustand";

// Definir el tipo para el store de activos
type ActivoStore = {
  actualizar: number;
  refrescar: () => void;
};

// Crear el store de activos usando Zustand
export const useActivoStore = create<ActivoStore>((set) => ({
  actualizar: 0,
  refrescar: () => set((state) => ({ actualizar: state.actualizar + 1 })),
}));