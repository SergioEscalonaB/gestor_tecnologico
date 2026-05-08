
export type Mantenimiento = {
  id: number;
  activoId: number;
  activo_nombre: string;
  tipo: string;
  descripcion: string;
  fecha_programada: string;
  responsable: string;
  estado: string;
  fecha_finalizacion?: string | null;
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
