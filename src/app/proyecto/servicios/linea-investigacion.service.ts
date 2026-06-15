import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LineaInvestigacionDTOSalida } from '../modelos/linea-investigacion-dto-salida';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LineaInvestigacionService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/lineas-investigacion`;

  constructor(private http: HttpClient) {}

  listar(): Observable<LineaInvestigacionDTOSalida[]> {
    return this.http.get<LineaInvestigacionDTOSalida[]>(this.apiUrl);
  }
}
