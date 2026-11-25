import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProyectoDTOEntrada } from '../modelos/proyecto-dto-entrada';
import { LineaInvestigacionDTOSalida } from '../modelos/linea-investigacion-dto-salida';
import { TipoProyectoDTOSalida } from '../modelos/tipo-proyecto-dto-salida';
import { DocenteDTOSalida } from '../../docente/modelos/docente-dto-salida';
import { ProyectoService } from '../servicios/proyecto.service';
import { LineaInvestigacionService } from '../servicios/linea-investigacion.service';
import { TipoProyectoService } from '../servicios/tipo-proyecto.service';
import { DocenteService } from '../../docente/servicios/docente.service';
import { AuthService } from '../../auth/servicios/auth.service';
import { extraerMensajeError } from '../../shared/utils/error.util';

@Component({
  selector: 'app-registrar-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registrar-proyecto.component.html',
  styleUrls: ['./registrar-proyecto.component.css']
})
export class RegistrarProyectoComponent implements OnInit {
  form: FormGroup;
  lineasInvestigacion: LineaInvestigacionDTOSalida[] = [];
  docentes: DocenteDTOSalida[] = [];
  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  directorPreasignado = false;
  idDirectorRuta: number | null = null;

  tiposProyecto: TipoProyectoDTOSalida[] = [];

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private lineaInvestigacionService: LineaInvestigacionService,
    private tipoProyectoService: TipoProyectoService,
    private docenteService: DocenteService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      resumen: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      objetivos: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      idTipoProyecto: [null, [Validators.required]],
      idLineaInvestigacion: [null, [Validators.required]],
      idDirector: [null, [Validators.required]],
      activado: [true]
    });
  }

  ngOnInit(): void {
    const idDocenteToken = this.authService.getIdDocente();
    if (idDocenteToken) {
      this.idDirectorRuta = idDocenteToken;
      this.directorPreasignado = true;
      this.form.get('idDirector')!.setValue(idDocenteToken);
      this.form.get('idDirector')!.disable();
    }
    this.cargarLineasInvestigacion();
    this.cargarTiposProyecto();
    this.cargarDocentes();
  }

  cargarTiposProyecto(): void {
    this.tipoProyectoService.listar().subscribe({
      next: (data) => { this.tiposProyecto = data; },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los tipos de proyecto.';
      }
    });
  }

  cargarLineasInvestigacion(): void {
    this.lineaInvestigacionService.listar().subscribe({
      next: (data) => { this.lineasInvestigacion = data; },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las líneas de investigación.';
      }
    });
  }

  cargarDocentes(): void {
    this.docenteService.listar().subscribe({
      next: (data) => { this.docentes = data; },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los docentes.';
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  get directorSeleccionado(): DocenteDTOSalida | undefined {
    const id = this.form.getRawValue().idDirector;
    return this.docentes.find(d => d.id === id);
  }

  // Conserva el director preasignado: al estar deshabilitado no se valida
  limpiar(): void {
    this.form.reset({ activado: true, idDirector: this.idDirectorRuta });
  }

  registrar(): void {
    this.mensajeExito = null;
    this.mensajeError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    // getRawValue incluye los controles deshabilitados (idDirector bloqueado)
    const proyecto: ProyectoDTOEntrada = this.form.getRawValue();

    this.proyectoService.registrar(proyecto).subscribe({
      next: () => {
        this.enviando = false;
        this.mensajeExito = 'Proyecto registrado correctamente.';
        this.limpiar();
        this.irArriba();
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError =
          extraerMensajeError(err, 'No se pudo registrar el proyecto. Inténtalo de nuevo.');
        this.irArriba();
      }
    });
  }

  // Los mensajes de éxito y error se muestran sobre el formulario
  private irArriba(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
