import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const rolGuard = (rolesPermitidos: string[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  const rol = auth.getRol();
  if (rol && rolesPermitidos.includes(rol)) return true;

  // Redirigir a la página correspondiente al rol real
  if (rol === 'DOCENTE') {
    const idDocente = auth.getIdDocente();
    if (idDocente) return router.createUrlTree(['/docentes', idDocente, 'proyectos']);
  }
  return router.createUrlTree(['/proyectos/filtrar']);
};
