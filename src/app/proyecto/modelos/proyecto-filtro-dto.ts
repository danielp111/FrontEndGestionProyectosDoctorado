export interface ProyectoFiltroDTO {
  titulo?: string;
  resumen?: string;
  objetivos?: string;
  idTipoProyecto?: number | null;
  idDirector?: number | null;
  idLineaInvestigacion?: number | null;
  activado?: boolean;
}
