import { LineaInvestigacionDTOSalida } from './linea-investigacion-dto-salida';
import { TipoProyectoDTOSalida } from './tipo-proyecto-dto-salida';
import { DocenteDTOSalida } from '../../docente/modelos/docente-dto-salida';

export interface ProyectoDTOResultado {
  id: number;
  titulo: string;
  resumen: string;
  objetivos: string;
  tipoProyecto: TipoProyectoDTOSalida;
  lineaInvestigacion: LineaInvestigacionDTOSalida;
  director: DocenteDTOSalida;
  activado: boolean;
}
