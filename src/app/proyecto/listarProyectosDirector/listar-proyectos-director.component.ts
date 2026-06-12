import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProyectoDTOResultado } from '../modelos/proyecto-dto-resultado';
import { ProyectoDTOEntrada } from '../modelos/proyecto-dto-entrada';
import { LineaInvestigacionDTOSalida } from '../modelos/linea-investigacion-dto-salida';
import { ProyectoService } from '../servicios/proyecto.service';
import { LineaInvestigacionService } from '../servicios/linea-investigacion.service';
import { DocenteService } from '../../docente/servicios/docente.service';
import { DocenteDTOSalida } from '../../docente/modelos/docente-dto-salida';
import { AuthService } from '../../auth/servicios/auth.service';

@Component({
  selector: 'app-listar-proyectos-director',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listar-proyectos-director.component.html',
  styleUrls: ['./listar-proyectos-director.component.css']
})
export class ListarProyectosDirectorComponent implements OnInit {
  proyectos: ProyectoDTOResultado[] = [];
  director: DocenteDTOSalida | null = null;
  docentes: DocenteDTOSalida[] = [];
  lineasInvestigacion: LineaInvestigacionDTOSalida[] = [];
  idDocente!: number;
  cargando = false;
  error: string | null = null;

  formEditar: FormGroup;
  modalAbierto = false;
  proyectoEditandoId: number | null = null;
  guardando = false;
  errorModal: string | null = null;

  modalVerAbierto = false;
  proyectoVer: ProyectoDTOResultado | null = null;

  filtroTitulo = '';
  filtroTipo = '';
  filtroLinea = '';

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
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private lineaInvestigacionService: LineaInvestigacionService,
    private docenteService: DocenteService,
    private authService: AuthService
  ) {
    this.formEditar = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      resumen: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      objetivos: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      tipoProyecto: ['', [Validators.required]],
      idLineaInvestigacion: [null, [Validators.required]],
      idDirector: [null, [Validators.required]],
      activado: [true]
    });
  }

  ngOnInit(): void {
    const idEnRuta = Number(this.route.snapshot.paramMap.get('idDocente'));
    const esDocente = this.authService.getRol() === 'DOCENTE';
    const idDelToken = this.authService.getIdDocente();

    if (esDocente) {
      if (!idDelToken) {
        this.router.navigate(['/']);
        return;
      }
      if (idDelToken !== idEnRuta) {
        this.router.navigate(['/docentes', idDelToken, 'proyectos']);
        return;
      }
      this.idDocente = idDelToken;
    } else {
      this.idDocente = idEnRuta;
    }

    this.cargarDirector();
    this.cargarProyectos();
    this.cargarLineasInvestigacion();
    this.cargarDocentes();
  }

  cargarDirector(): void {
    this.docenteService.obtenerPorId(this.idDocente).subscribe({
      next: (data) => { this.director = data; },
      error: () => { /* director no crítico, no bloquea la vista */ }
    });
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.error = null;
    this.proyectoService.listarPorDirector(this.idDocente).subscribe({
      next: (data) => {
        this.proyectos = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los proyectos. Verifica que el backend esté disponible.';
        this.cargando = false;
      }
    });
  }

  cargarLineasInvestigacion(): void {
    this.lineaInvestigacionService.listar().subscribe({
      next: (data) => { this.lineasInvestigacion = data; },
      error: () => { /* no bloquea la vista principal */ }
    });
  }

  cargarDocentes(): void {
    this.docenteService.listar().subscribe({
      next: (data) => { this.docentes = data; },
      error: () => { /* no bloquea la vista principal */ }
    });
  }

  get proyectosFiltrados(): ProyectoDTOResultado[] {
    return this.proyectos.filter(p => {
      const coincideTitulo = !this.filtroTitulo ||
        p.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase());
      const coincideTipo = !this.filtroTipo ||
        p.tipoProyecto === this.filtroTipo;
      const coincideLinea = !this.filtroLinea ||
        p.lineaInvestigacion?.nombre === this.filtroLinea;
      return coincideTitulo && coincideTipo && coincideLinea;
    });
  }

  limpiarFiltros(): void {
    this.filtroTitulo = '';
    this.filtroTipo = '';
    this.filtroLinea = '';
    this.paginaActual = 1;
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtroTitulo || this.filtroTipo || this.filtroLinea);
  }

  get totalPaginas(): number {
    return Math.ceil(this.proyectosFiltrados.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get proyectosPaginados(): ProyectoDTOResultado[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.proyectosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get fm() {
    return this.formEditar.controls;
  }

  abrirModalEditar(proyecto: ProyectoDTOResultado): void {
    this.proyectoEditandoId = proyecto.id;
    this.errorModal = null;
    this.formEditar.reset();
    this.formEditar.patchValue({
      titulo: proyecto.titulo,
      resumen: proyecto.resumen,
      objetivos: proyecto.objetivos,
      tipoProyecto: proyecto.tipoProyecto,
      idLineaInvestigacion: proyecto.lineaInvestigacion?.id ?? null,
      idDirector: proyecto.director?.id ?? null,
      activado: proyecto.activado
    });
    this.formEditar.get('idDirector')!.disable();
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.proyectoEditandoId = null;
    this.errorModal = null;
  }

  abrirModalVer(proyecto: ProyectoDTOResultado): void {
    this.proyectoVer = proyecto;
    this.modalVerAbierto = true;
  }

  cerrarModalVer(): void {
    this.modalVerAbierto = false;
    this.proyectoVer = null;
  }

  eliminarProyecto(proyecto: ProyectoDTOResultado): void {
    Swal.fire({
      title: '¿Eliminar proyecto?',
      text: proyecto.titulo,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.proyectoService.eliminar(proyecto.id).subscribe({
        next: () => {
          this.proyectos = this.proyectos.filter(p => p.id !== proyecto.id);
          Swal.fire({
            title: 'Eliminado',
            text: 'El proyecto ha sido eliminado correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el proyecto. Inténtalo de nuevo.',
            icon: 'error'
          });
        }
      });
    });
  }

  cambiarEstado(proyecto: ProyectoDTOResultado, activado: boolean): void {
    const estadoAnterior = proyecto.activado;
    proyecto.activado = activado;

    this.proyectoService.cambiarEstado(proyecto.id, activado).subscribe({
      next: (actualizado) => { proyecto.activado = actualizado.activado; },
      error: () => {
        proyecto.activado = estadoAnterior;
        this.error = 'No se pudo cambiar el estado del proyecto.';
      }
    });
  }

  guardarCambios(): void {
    this.errorModal = null;

    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }
    if (this.proyectoEditandoId == null) {
      return;
    }

    this.guardando = true;
    const datos: ProyectoDTOEntrada = this.formEditar.getRawValue();

    this.proyectoService.actualizar(this.proyectoEditandoId, datos).subscribe({
      next: (actualizado) => {
        this.guardando = false;
        const indice = this.proyectos.findIndex(p => p.id === actualizado.id);
        if (indice !== -1) {
          this.proyectos[indice] = actualizado;
        }
        this.cerrarModal();
      },
      error: (err) => {
        this.guardando = false;
        this.errorModal =
          err?.error?.message ?? 'No se pudo actualizar el proyecto. Inténtalo de nuevo.';
      }
    });
  }
}
