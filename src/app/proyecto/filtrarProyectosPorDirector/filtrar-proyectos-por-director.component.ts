import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProyectoDTOResultado } from '../modelos/proyecto-dto-resultado';
import { ProyectoFiltroDTO } from '../modelos/proyecto-filtro-dto';
import { LineaInvestigacionDTOSalida } from '../modelos/linea-investigacion-dto-salida';
import { TipoProyectoDTOSalida } from '../modelos/tipo-proyecto-dto-salida';
import { DocenteDTOSalida } from '../../docente/modelos/docente-dto-salida';
import { ProyectoService } from '../servicios/proyecto.service';
import { LineaInvestigacionService } from '../servicios/linea-investigacion.service';
import { TipoProyectoService } from '../servicios/tipo-proyecto.service';
import { DocenteService } from '../../docente/servicios/docente.service';
import { extraerMensajeError } from '../../shared/utils/error.util';

@Component({
  selector: 'app-filtrar-proyectos-por-director',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './filtrar-proyectos-por-director.component.html',
  styleUrls: ['./filtrar-proyectos-por-director.component.css']
})
export class FiltrarProyectosPorDirectorComponent implements OnInit {
  resultados: ProyectoDTOResultado[] = [];
  docentes: DocenteDTOSalida[] = [];
  lineasInvestigacion: LineaInvestigacionDTOSalida[] = [];
  cargando = false;
  error: string | null = null;
  buscado = false;

  modalVerAbierto = false;
  proyectoVer: ProyectoDTOResultado | null = null;

  modalVerDocenteAbierto = false;
  docenteVer: DocenteDTOSalida | null = null;

  filtro: ProyectoFiltroDTO = { idTipoProyecto: null, idDirector: null, idLineaInvestigacion: null };
  filtroActivado = '';
  // Copia de lo último que se envió al backend; de ahí salen los chips
  filtroAplicado: ProyectoFiltroDTO = {};
  masFiltrosAbierto = false;

  paginaActual = 1;
  readonly elementosPorPagina = 5;

  tiposProyecto: TipoProyectoDTOSalida[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private lineaInvestigacionService: LineaInvestigacionService,
    private tipoProyectoService: TipoProyectoService,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.lineaInvestigacionService.listar().subscribe({
      next: (data) => { this.lineasInvestigacion = data; },
      error: () => {}
    });
    this.tipoProyectoService.listar().subscribe({
      next: (data) => { this.tiposProyecto = data; },
      error: () => {}
    });
    this.docenteService.listar().subscribe({
      next: (data) => { this.docentes = data; },
      error: () => {}
    });
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.error = null;
    this.paginaActual = 1;
    this.buscado = true;

    const filtroEnviar: ProyectoFiltroDTO = {};
    if (this.filtro.titulo?.trim())       filtroEnviar.titulo       = this.filtro.titulo.trim();
    if (this.filtro.resumen?.trim())      filtroEnviar.resumen      = this.filtro.resumen.trim();
    if (this.filtro.objetivos?.trim())    filtroEnviar.objetivos    = this.filtro.objetivos.trim();
    if (this.filtro.idTipoProyecto != null) filtroEnviar.idTipoProyecto = this.filtro.idTipoProyecto;
    if (this.filtro.idDirector != null)   filtroEnviar.idDirector   = this.filtro.idDirector;
    if (this.filtro.idLineaInvestigacion != null) filtroEnviar.idLineaInvestigacion = this.filtro.idLineaInvestigacion;
    if (this.filtroActivado !== '')       filtroEnviar.activado     = this.filtroActivado === 'true';
    this.filtroAplicado = { ...filtroEnviar };

    this.proyectoService.filtrar(filtroEnviar).subscribe({
      next: (data) => {
        this.resultados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al filtrar proyectos:', err);
        this.error = extraerMensajeError(err,
          `Error ${err?.status ?? ''}: ${err?.statusText ?? 'No se pudieron obtener los resultados.'}`);
        this.cargando = false;
      }
    });
  }

  limpiar(): void {
    this.filtro = { idTipoProyecto: null, idDirector: null, idLineaInvestigacion: null };
    this.filtroActivado = '';
    this.buscar();
  }

  get filtrosAvanzadosActivos(): number {
    return [this.filtro.resumen, this.filtro.objetivos].filter(v => !!v?.trim()).length;
  }

  get chipsFiltro(): { clave: keyof ProyectoFiltroDTO; etiqueta: string }[] {
    const f = this.filtroAplicado;
    const chips: { clave: keyof ProyectoFiltroDTO; etiqueta: string }[] = [];
    if (f.titulo) chips.push({ clave: 'titulo', etiqueta: `Título: ${f.titulo}` });
    if (f.idTipoProyecto != null) {
      chips.push({ clave: 'idTipoProyecto', etiqueta: `Tipo: ${this.tiposProyecto.find(t => t.id === f.idTipoProyecto)?.nombre ?? ''}` });
    }
    if (f.idLineaInvestigacion != null) {
      chips.push({ clave: 'idLineaInvestigacion', etiqueta: `Línea: ${this.lineasInvestigacion.find(l => l.id === f.idLineaInvestigacion)?.nombre ?? ''}` });
    }
    if (f.idDirector != null) {
      const d = this.docentes.find(doc => doc.id === f.idDirector);
      chips.push({ clave: 'idDirector', etiqueta: `Director: ${d ? d.nombres + ' ' + d.apellidos : ''}` });
    }
    if (f.activado != null) chips.push({ clave: 'activado', etiqueta: `Estado: ${f.activado ? 'Activo' : 'Inactivo'}` });
    if (f.resumen) chips.push({ clave: 'resumen', etiqueta: `Resumen: ${f.resumen}` });
    if (f.objetivos) chips.push({ clave: 'objetivos', etiqueta: `Objetivos: ${f.objetivos}` });
    return chips;
  }

  trackChip(_: number, chip: { clave: keyof ProyectoFiltroDTO }): string {
    return chip.clave;
  }

  quitarFiltro(clave: keyof ProyectoFiltroDTO): void {
    if (clave === 'activado') {
      this.filtroActivado = '';
    } else if (clave === 'idTipoProyecto' || clave === 'idDirector' || clave === 'idLineaInvestigacion') {
      this.filtro[clave] = null;
    } else {
      this.filtro[clave] = '';
    }
    this.buscar();
  }

  get resultadosPaginados(): ProyectoDTOResultado[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.resultados.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.resultados.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  abrirModalVer(proyecto: ProyectoDTOResultado): void {
    this.proyectoVer = proyecto;
    this.modalVerAbierto = true;
  }

  cerrarModalVer(): void {
    this.modalVerAbierto = false;
    this.proyectoVer = null;
  }

  abrirModalVerDocente(docente: DocenteDTOSalida): void {
    this.docenteVer = docente;
    this.modalVerDocenteAbierto = true;
  }

  cerrarModalVerDocente(): void {
    this.modalVerDocenteAbierto = false;
    this.docenteVer = null;
  }
}
