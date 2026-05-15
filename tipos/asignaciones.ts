import { Activo } from "./activo";
import { Empleado } from "./empleado";

export type Asignacion = {
    id: number;
    activoId: number;
    empleadoId: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    activo?: Activo;
    empleado?: Empleado;
}