import { create } from "zustand";

// Definir el tipo para el store de mantenimiento
type UsuarioStore = {
  actualizar: number;
  refrescar: () => void;
};

// Crear el store de mantenimiento usando Zustand
export const useUsuarioStore = create<UsuarioStore>((set) => ({
  actualizar: 0,
  refrescar: () => set((state) => ({ actualizar: state.actualizar + 1 })),
}));