export interface MenuItem {
  label: string;
  /** Ruta interna del router (ej. '/programa/conoce-el-programa') */
  route?: string;
  /** URL externa absoluta (ej. 'https://www.unicauca.edu.co/') */
  externalUrl?: string;
  children?: MenuItem[];
}
