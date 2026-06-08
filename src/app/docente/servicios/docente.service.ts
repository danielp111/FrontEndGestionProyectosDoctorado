import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DocenteDTOSalida } from '../modelos/docente-dto-salida';
import { DocenteDTOEntrada } from '../modelos/docente-dto-entrada';
import { DocenteFiltroDTO } from '../modelos/docente-filtro-dto';

@Injectable({ providedIn: 'root' })
export class DocenteService {
  private readonly apiUrl = 'http://localhost:9090/api/docentes';

  constructor(private http: HttpClient) {}

  /** Lista todos los docentes. */
  listar(): Observable<DocenteDTOSalida[]> {
    return this.http.get<DocenteDTOSalida[]>(this.apiUrl);
  }

  /** Obtiene un docente por su ID. */
  obtenerPorId(id: number): Observable<DocenteDTOSalida> {
    return this.http.get<DocenteDTOSalida>(`${this.apiUrl}/${id}`);
  }

  /** Registra un nuevo docente. */
  registrar(docente: DocenteDTOEntrada): Observable<DocenteDTOSalida> {
    return this.http.post<DocenteDTOSalida>(this.apiUrl, docente);
  }

  /** Actualiza un docente existente. */
  actualizar(id: number, docente: DocenteDTOEntrada): Observable<DocenteDTOSalida> {
    return this.http.put<DocenteDTOSalida>(`${this.apiUrl}/${id}`, docente);
  }

  /** Activa o inactiva un docente. */
  cambiarEstado(id: number, activo: boolean): Observable<DocenteDTOSalida> {
    const params = new HttpParams().set('activo', activo);
    return this.http.put<DocenteDTOSalida>(`${this.apiUrl}/${id}/estado`, null, { params });
  }

  /** Filtra los docentes en el servidor según el DTO de filtro. */
  filtrar(filtro: DocenteFiltroDTO): Observable<DocenteDTOSalida[]> {
    let params = new HttpParams();
    if (filtro.nombres) {
      params = params.set('nombres', filtro.nombres);
    }
    if (filtro.apellidos) {
      params = params.set('apellidos', filtro.apellidos);
    }
    if (filtro.idGrupo != null) {
      params = params.set('idGrupo', filtro.idGrupo);
    }
    if (filtro.nombreGrupo) {
      params = params.set('nombreGrupo', filtro.nombreGrupo);
    }
    return this.http.get<DocenteDTOSalida[]>(`${this.apiUrl}/filtrar`, { params });
  }
}
