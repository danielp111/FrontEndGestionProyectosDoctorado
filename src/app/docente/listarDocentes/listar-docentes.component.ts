import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DocenteDTOSalida } from '../modelos/docente-dto-salida';
import { DocenteDTOEntrada } from '../modelos/docente-dto-entrada';
import { DocenteFiltroDTO } from '../modelos/docente-filtro-dto';
import { GrupoDTOSalida } from '../modelos/grupo-dto-salida';
import { DocenteService } from '../servicios/docente.service';
import { GrupoService } from '../servicios/grupo.service';

@Component({
  selector: 'app-listar-docentes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listar-docentes.component.html',
  styleUrls: ['./listar-docentes.component.css']
})
export class ListarDocentesComponent implements OnInit {
  docentes: DocenteDTOSalida[] = [];
  grupos: GrupoDTOSalida[] = [];
  filtro: DocenteFiltroDTO = {};
  cargando = false;
  error: string | null = null;

  // Estado del modal de edición.
  form: FormGroup;
  modalAbierto = false;
  docenteEditandoId: number | null = null;
  guardando = false;
  errorModal: string | null = null;

  // Estado del modal de detalle (solo lectura).
  modalVerAbierto = false;
  docenteVer: DocenteDTOSalida | null = null;

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
    this.cargarDocentes();
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.grupoService.listar().subscribe({
      next: (data) => {
        this.grupos = data;
      },
      error: () => {
        this.error = 'No se pudieron cargar los grupos.';
      }
    });
  }

  cargarDocentes(): void {
    this.cargando = true;
    this.error = null;
    this.docenteService.listar().subscribe({
      next: (data) => {
        this.docentes = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los docentes. Verifica que el backend esté disponible.';
        this.cargando = false;
      }
    });
  }

  /** Filtrado en el cliente sobre la lista ya cargada. */
  get docentesFiltrados(): DocenteDTOSalida[] {
    return this.docentes.filter((d) => {
      const coincideNombres =
        !this.filtro.nombres ||
        d.nombres?.toLowerCase().includes(this.filtro.nombres.toLowerCase());

      const coincideApellidos =
        !this.filtro.apellidos ||
        d.apellidos?.toLowerCase().includes(this.filtro.apellidos.toLowerCase());

      const coincideNombreGrupo =
        !this.filtro.nombreGrupo ||
        d.grupo?.nombre?.toLowerCase().includes(this.filtro.nombreGrupo.toLowerCase());

      return coincideNombres && coincideApellidos && coincideNombreGrupo;
    });
  }

  limpiarFiltros(): void {
    this.filtro = {};
  }

  hayFiltrosActivos(): boolean {
    return !!(
      this.filtro.nombres ||
      this.filtro.apellidos ||
      this.filtro.nombreGrupo
    );
  }

  /** Acceso corto a los controles del formulario del modal. */
  get fm() {
    return this.form.controls;
  }

  abrirModalEditar(docente: DocenteDTOSalida): void {
    this.docenteEditandoId = docente.id;
    this.errorModal = null;
    this.form.reset();
    this.form.patchValue({
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      oficina: docente.oficina,
      correo: docente.correo,
      telefono: docente.telefono,
      celular: docente.celular,
      idGrupo: docente.grupo?.id ?? null
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.docenteEditandoId = null;
    this.errorModal = null;
  }

  guardarCambios(): void {
    this.errorModal = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.docenteEditandoId == null) {
      return;
    }

    this.guardando = true;
    const docente: DocenteDTOEntrada = this.form.value;

    this.docenteService.actualizar(this.docenteEditandoId, docente).subscribe({
      next: (actualizado) => {
        this.guardando = false;
        const indice = this.docentes.findIndex((d) => d.id === actualizado.id);
        if (indice !== -1) {
          this.docentes[indice] = actualizado;
        }
        this.cerrarModal();
      },
      error: (err) => {
        this.guardando = false;
        this.errorModal =
          err?.error?.message ?? 'No se pudo actualizar el docente. Inténtalo de nuevo.';
      }
    });
  }

  cambiarEstado(docente: DocenteDTOSalida, activo: boolean): void {
    const estadoAnterior = docente.activo;
    // Actualización optimista para que el switch responda de inmediato.
    docente.activo = activo;

    this.docenteService.cambiarEstado(docente.id, activo).subscribe({
      next: (actualizado) => {
        docente.activo = actualizado.activo;
      },
      error: () => {
        // Revierte el switch si la petición falla.
        docente.activo = estadoAnterior;
        this.error = 'No se pudo cambiar el estado del docente.';
      }
    });
  }
}
