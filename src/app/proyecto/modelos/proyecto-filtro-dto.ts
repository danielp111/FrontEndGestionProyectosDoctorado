export interface ProyectoFiltroDTO {
  titulo?: string;
  resumen?: string;
  objetivos?: string;
  tipo?: string;
  idDirector?: number | null;
  idLineaInvestigacion?: number | null;
  activado?: boolean;
}
