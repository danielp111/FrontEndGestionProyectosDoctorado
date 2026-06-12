import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/servicios/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {

  constructor(public authService: AuthService, private router: Router) {}

  get esAdmin(): boolean   { return this.authService.getRol() === 'ADMINISTRADOR'; }
  get esDocente(): boolean { return this.authService.getRol() === 'DOCENTE'; }
  get idDocente(): number | null { return this.authService.getIdDocente(); }

  readonly mobileOpen = signal(false);

  toggleMobile(): void {
    this.mobileOpen.update(open => !open);
  }

  cerrarMovil(): void {
    this.mobileOpen.set(false);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
