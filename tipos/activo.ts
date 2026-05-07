
export type Activo = {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  ubicacion: string | null;
  valor_compra: number | null;
  proveedor: string | null;
  fecha_compra: string;
  empleadoResponsableId: number | null;
};