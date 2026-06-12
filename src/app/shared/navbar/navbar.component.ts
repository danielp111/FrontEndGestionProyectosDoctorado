import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/servicios/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuAbierto = false;

  constructor(public authService: AuthService, private router: Router) {}

  get nombre(): string | null  { return this.authService.getNombre(); }
  get esAdmin(): boolean       { return this.authService.getRol() === 'ADMINISTRADOR'; }
  get esDocente(): boolean     { return this.authService.getRol() === 'DOCENTE'; }
  get idDocente(): number|null { return this.authService.getIdDocente(); }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
