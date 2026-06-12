import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../models/menu-item.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  /** Enlaces de interés (bloque "links-rapidos" del sitio original). */
  readonly quickLinks: MenuItem[] = [
    { label: 'Universidad del Cauca', externalUrl: 'https://www.unicauca.edu.co/' },
    { label: 'Centro de Posgrados', externalUrl: 'http://www.unicauca.edu.co/posgrados/' },
    { label: 'Área de Egresados', externalUrl: 'http://www.unicauca.edu.co/areadeegresados/' },
    { label: 'Portal de Ofertas Laborales', externalUrl: 'http://oportunidadeslaborales.portal.unicauca.edu.co/' },
    { label: 'Biblioteca', externalUrl: 'http://biblio.unicauca.edu.co/' },
    { label: 'Departamento de Sistemas', externalUrl: 'http://www.unicauca.edu.co/sistemas/' },
  ];

  /** Datos de contacto (bloque "Contacto" del sitio original). */
  readonly contact = {
    program: 'DOCTORADO EN CIENCIAS DE LA COMPUTACIÓN',
    faculty: 'Facultad de Ingeniería Electrónica y Telecomunicaciones',
    phone: '+57 (2) 8209800, ext. 2100 - 2102',
  };
}
