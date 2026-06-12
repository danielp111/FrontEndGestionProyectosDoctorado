import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProyectoDTOResultado } from '../modelos/proyecto-dto-resultado';
import { ProyectoFiltroDTO } from '../modelos/proyecto-filtro-dto';
import { LineaInvestigacionDTOSalida } from '../modelos/linea-investigacion-dto-salida';
import { DocenteDTOSalida } from '../../docente/modelos/docente-dto-salida';
import { ProyectoService } from '../servicios/proyecto.service';
import { LineaInvestigacionService } from '../servicios/linea-investigacion.service';
import { DocenteService } from '../../docente/servicios/docente.service';

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

  filtro: ProyectoFiltroDTO = { tipo: '', idDirector: null, idLineaInvestigacion: null };
  filtroActivado = '';

  paginaActual = 1;
  readonly elementosPorPagina = 5;

  readonly tiposProyecto = [
    'Tesis doctoral',
    'Trabajo de grado',
    'Investigación aplicada',
    'Desarrollo tecnológico',
    'Innovación'
  ];

  constructor(
    private proyectoService: ProyectoService,
    private lineaInvestigacionService: LineaInvestigacionService,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.lineaInvestigacionService.listar().subscribe({
      next: (data) => { this.lineasInvestigacion = data; },
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
    if (this.filtro.tipo)                 filtroEnviar.tipo         = this.filtro.tipo;
    if (this.filtro.idDirector != null)   filtroEnviar.idDirector   = this.filtro.idDirector;
    if (this.filtro.idLineaInvestigacion != null) filtroEnviar.idLineaInvestigacion = this.filtro.idLineaInvestigacion;
    if (this.filtroActivado !== '')       filtroEnviar.activado     = this.filtroActivado === 'true';

    this.proyectoService.filtrar(filtroEnviar).subscribe({
      next: (data) => {
        this.resultados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al filtrar proyectos:', err);
        this.error = err?.error?.message
          ?? `Error ${err?.status ?? ''}: ${err?.statusText ?? 'No se pudieron obtener los resultados.'}`;
        this.cargando = false;
      }
    });
  }

  limpiar(): void {
    this.filtro = { tipo: '', idDirector: null, idLineaInvestigacion: null };
    this.filtroActivado = '';
    this.resultados = [];
    this.buscado = false;
    this.paginaActual = 1;
    this.error = null;
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
