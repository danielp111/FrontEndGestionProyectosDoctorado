import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProyectoDTOResultado } from '../modelos/proyecto-dto-resultado';
import { ProyectoDTOEntrada } from '../modelos/proyecto-dto-entrada';
import { ProyectoFiltroDTO } from '../modelos/proyecto-filtro-dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/proyectos`;
  private readonly docentesUrl = `${environment.apiBaseUrl}/api/docentes`;

  constructor(private http: HttpClient) {}

  listarPorDirector(idDocente: number): Observable<ProyectoDTOResultado[]> {
    return this.http.get<ProyectoDTOResultado[]>(`${this.docentesUrl}/${idDocente}/proyectos`);
  }

  registrar(proyecto: ProyectoDTOEntrada): Observable<ProyectoDTOResultado> {
    return this.http.post<ProyectoDTOResultado>(this.apiUrl, proyecto);
  }

  actualizar(id: number, proyecto: ProyectoDTOEntrada): Observable<ProyectoDTOResultado> {
    return this.http.put<ProyectoDTOResultado>(`${this.apiUrl}/${id}`, proyecto);
  }

  cambiarEstado(id: number, activado: boolean): Observable<ProyectoDTOResultado> {
    const params = new HttpParams().set('activado', activado);
    return this.http.put<ProyectoDTOResultado>(`${this.apiUrl}/${id}/estado`, null, { params });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  filtrar(filtro: ProyectoFiltroDTO): Observable<ProyectoDTOResultado[]> {
    return this.http.post<ProyectoDTOResultado[]>(`${this.apiUrl}/filtrar`, filtro);
  }
}
