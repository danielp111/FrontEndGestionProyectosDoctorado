import { Routes } from '@angular/router';

import { ListarDocentesComponent } from './docente/listarDocentes/listar-docentes.component';
import { RegistrarDocenteComponent } from './docente/registrarDocente/registrar-docente.component';
import { ActualizarDocenteComponent } from './docente/actualizarDocente/actualizar-docente.component';

export const routes: Routes = [
  { path: 'docentes', component: ListarDocentesComponent },
  { path: 'docentes/registrar', component: RegistrarDocenteComponent },
  { path: 'docentes/actualizar/:id', component: ActualizarDocenteComponent },
  { path: '', redirectTo: 'docentes', pathMatch: 'full' }
];
