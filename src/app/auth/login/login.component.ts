import { Component, AfterViewInit, ElementRef, NgZone, ViewChild, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { GOOGLE_CLIENT_ID } from '../google-client-id';

declare const google: {
  accounts: {
    id: {
      initialize(config: { client_id: string; callback: (res: { credential: string }) => void }): void;
      renderButton(parent: HTMLElement, options: object): void;
    };
  };
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLElement>;

  cargando = false;
  error: string | null = null;

  readonly imagenesCarrusel = [
    'assets/img/imagenesCarruselLogin/Doc-Computacion-bienvenida-6-scaled%20(1).jpg',
    'assets/img/imagenesCarruselLogin/Socialización10.jpg',
    'assets/img/imagenesCarruselLogin/Socialización17.jpg',
  ];
  imagenActual = 0;
  private intervalo: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  siguiente(): void {
    this.imagenActual = (this.imagenActual + 1) % this.imagenesCarrusel.length;
  }

  anterior(): void {
    this.imagenActual = (this.imagenActual - 1 + this.imagenesCarrusel.length) % this.imagenesCarrusel.length;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.intervalo = setInterval(() => {
      this.ngZone.run(() => this.siguiente());
    }, 3000);

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/docentes']);
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.enviarTokenAlBackend(response.credential));
      }
    });
    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'es',
      width: 280
    });
  }

  private enviarTokenAlBackend(credential: string): void {
    this.cargando = true;
    this.error = null;
    this.authService.loginConGoogle(credential).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/docentes']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message ?? 'No fue posible iniciar sesión. Contacta con el administrador del sistema.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }
}
