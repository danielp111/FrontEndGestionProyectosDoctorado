import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DocenteDTOEntrada } from '../modelos/docente-dto-entrada';
import { GrupoDTOSalida } from '../modelos/grupo-dto-salida';
import { DocenteService } from '../servicios/docente.service';
import { GrupoService } from '../servicios/grupo.service';
import { AuthService } from '../../auth/servicios/auth.service';

@Component({
  selector: 'app-actualizar-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './actualizar-docente.component.html',
  styleUrls: ['./actualizar-docente.component.css']
})
export class ActualizarDocenteComponent implements OnInit {
  form: FormGroup;
  grupos: GrupoDTOSalida[] = [];
  id!: number;
  cargando = false;
  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private docenteService: DocenteService,
    private grupoService: GrupoService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      oficina: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: [''],
      idGrupo: [null, [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const idEnRuta = Number(this.route.snapshot.paramMap.get('id'));
    const esDocente = this.authService.getRol() === 'DOCENTE';
    const idDelToken = this.authService.getIdDocente();

    if (esDocente) {
      if (!idDelToken) { this.router.navigate(['/']); return; }
      if (idDelToken !== idEnRuta) {
        this.router.navigate(['/docentes/actualizar', idDelToken]);
        return;
      }
    }

    this.id = idEnRuta;
    this.cargarGrupos();
    this.cargarDocente();
  }

  cargarGrupos(): void {
    this.grupoService.listar().subscribe({
      next: (data) => {
        this.grupos = data;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los grupos. Verifica que el backend esté disponible.';
      }
    });
  }

  cargarDocente(): void {
    this.cargando = true;
    this.docenteService.obtenerPorId(this.id).subscribe({
      next: (docente) => {
        this.form.patchValue({
          nombres: docente.nombres,
          apellidos: docente.apellidos,
          oficina: docente.oficina,
          correo: docente.correo,
          telefono: docente.telefono,
          celular: docente.celular,
          idGrupo: docente.grupo?.id ?? null,
          activo: docente.activo
        });
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el docente solicitado.';
        this.cargando = false;
      }
    });
  }

  get esAdmin(): boolean { return this.authService.getRol() === 'ADMINISTRADOR'; }

  /** Acceso corto a los controles desde la plantilla. */
  get f() {
    return this.form.controls;
  }

  actualizar(): void {
    this.mensajeExito = null;
    this.mensajeError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const docente: DocenteDTOEntrada = this.form.value;

    this.docenteService.actualizar(this.id, docente).subscribe({
      next: () => {
        this.enviando = false;
        this.mensajeExito = 'Docente actualizado correctamente.';
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError =
          err.error.message, 'No se pudo actualizar el docente. Inténtalo de nuevo  .';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/docentes']);
  }
}
