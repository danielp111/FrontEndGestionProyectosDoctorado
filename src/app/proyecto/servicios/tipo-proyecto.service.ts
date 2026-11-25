import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TipoProyectoDTOSalida } from '../modelos/tipo-proyecto-dto-salida';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TipoProyectoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/tipos-proyecto`;

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoProyectoDTOSalida[]> {
    return this.http.get<TipoProyectoDTOSalida[]>(this.apiUrl);
  }
}
