import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DocenteDTOEntrada } from '../modelos/docente-dto-entrada';
import { GrupoDTOSalida } from '../modelos/grupo-dto-salida';
import { DocenteService } from '../servicios/docente.service';
import { GrupoService } from '../servicios/grupo.service';
import { extraerMensajeError } from '../../shared/utils/error.util';

@Component({
  selector: 'app-registrar-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-docente.component.html',
  styleUrls: ['./registrar-docente.component.css']
})
export class RegistrarDocenteComponent implements OnInit {
  form: FormGroup;
  grupos: GrupoDTOSalida[] = [];
  enviando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private docenteService: DocenteService,
    private grupoService: GrupoService
  ) {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      oficina: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: [''],
      idGrupo: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarGrupos();
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

  /** Acceso corto a los controles desde la plantilla. */
  get f() {
    return this.form.controls;
  }

  registrar(): void {
    this.mensajeExito = null;
    this.mensajeError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const docente: DocenteDTOEntrada = this.form.value;

    this.docenteService.registrar(docente).subscribe({
      next: () => {
        this.enviando = false;
        this.mensajeExito = 'Docente registrado correctamente.';
        this.form.reset();
      },
      error: (err) => {
        this.enviando = false;

        this.mensajeError = extraerMensajeError(err, 'No se pudo registrar el docente. Inténtalo de nuevo.');
      }
    });
  }
}
