import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GrupoDTOSalida } from '../modelos/grupo-dto-salida';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly apiUrl = 'http://localhost:9090/api/grupos';

  constructor(private http: HttpClient) {}

  /** Lista todos los grupos. */
  listar(): Observable<GrupoDTOSalida[]> {
    return this.http.get<GrupoDTOSalida[]>(this.apiUrl);
  }
}
