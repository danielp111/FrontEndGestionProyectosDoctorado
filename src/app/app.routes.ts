import { Routes } from '@angular/router';

import { ListarDocentesComponent } from './docente/listarDocentes/listar-docentes.component';
import { RegistrarDocenteComponent } from './docente/registrarDocente/registrar-docente.component';
import { ActualizarDocenteComponent } from './docente/actualizarDocente/actualizar-docente.component';
import { ListarProyectosDirectorComponent } from './proyecto/listarProyectosDirector/listar-proyectos-director.component';
import { RegistrarProyectoComponent } from './proyecto/registrarProyecto/registrar-proyecto.component';
import { FiltrarProyectosPorDirectorComponent } from './proyecto/filtrarProyectosPorDirector/filtrar-proyectos-por-director.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/guards/auth.guard';
import { rolGuard } from './auth/guards/rol.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Pública — sin guardia
  {
    path: 'proyectos/filtrar',
    component: FiltrarProyectosPorDirectorComponent,
  },

  // Solo ADMINISTRADOR
  {
    path: 'docentes',
    component: ListarDocentesComponent,
    canActivate: [authGuard, rolGuard(['ADMINISTRADOR'])],
  },
  {
    path: 'docentes/registrar',
    component: RegistrarDocenteComponent,
    canActivate: [authGuard, rolGuard(['ADMINISTRADOR'])],
  },
  {
    path: 'docentes/actualizar/:id',
    component: ActualizarDocenteComponent,
    canActivate: [authGuard, rolGuard(['ADMINISTRADOR', 'DOCENTE'])],
  },
  {
    path: 'proyectos/registrar',
    component: RegistrarProyectoComponent,
    canActivate: [authGuard, rolGuard(['DOCENTE', 'ADMINISTRADOR'])],
  },

  // DOCENTE y ADMINISTRADOR
  {
    path: 'docentes/:idDocente/proyectos',
    component: ListarProyectosDirectorComponent,
    canActivate: [authGuard, rolGuard(['DOCENTE', 'ADMINISTRADOR'])],
  },

  { path: '', component: FiltrarProyectosPorDirectorComponent },
];
