import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';

type Lang = 'es' | 'en';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  /** Idioma actual — reemplaza los enlaces #l-es / #l-en del sitio original. */
  readonly lang = signal<Lang>('es');

  /** Título en dos líneas, como el <br> del sitio original. */
  readonly titleLines = computed<string[]>(() =>
    this.lang() === 'es'
      ? ['DOCTORADO EN', 'CIENCIAS DE LA COMPUTACIÓN']
      : ['PhD IN', 'COMPUTER SCIENCE']
  );

  setLang(lang: Lang): void {
    this.lang.set(lang);
    // Aquí puedes integrar tu servicio de i18n (ej. @ngx-translate o $localize)
  }
}
