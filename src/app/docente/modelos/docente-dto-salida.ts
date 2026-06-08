import { GrupoDTOSalida } from './grupo-dto-salida';

export interface DocenteDTOSalida {
  id: number;
  nombres: string;
  apellidos: string;
  oficina: string;
  correo: string;
  telefono: string;
  celular: string;
  grupo: GrupoDTOSalida;
  activo: boolean;
}
