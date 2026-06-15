import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface JwtResponseDTO {
  token: string;
  email: string;
  nombre: string;
  rol: string;
  idDocente?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/auth/google`;
  private readonly TOKEN_KEY    = 'auth_token';
  private readonly EMAIL_KEY    = 'auth_email';
  private readonly NOMBRE_KEY   = 'auth_nombre';
  private readonly ROL_KEY      = 'auth_rol';
  private readonly ID_DOC_KEY   = 'auth_id_docente';

  constructor(private http: HttpClient) {}

  loginConGoogle(credential: string): Observable<JwtResponseDTO> {
    return this.http.post<JwtResponseDTO>(this.apiUrl, { credential }).pipe(
      tap(res => {
        this.storage?.setItem(this.TOKEN_KEY,  res.token);
        this.storage?.setItem(this.EMAIL_KEY,  res.email);
        this.storage?.setItem(this.NOMBRE_KEY, res.nombre);
        this.storage?.setItem(this.ROL_KEY,    res.rol);
        if (res.idDocente != null) {
          this.storage?.setItem(this.ID_DOC_KEY, String(res.idDocente));
        }
      })
    );
  }

  private get storage(): Storage | null {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  }

  getToken(): string | null   { return this.storage?.getItem(this.TOKEN_KEY) ?? null; }
  getEmail(): string | null   { return this.storage?.getItem(this.EMAIL_KEY) ?? null; }
  getNombre(): string | null  { return this.storage?.getItem(this.NOMBRE_KEY) ?? null; }
  getRol(): string | null     { return this.storage?.getItem(this.ROL_KEY) ?? null; }

  getIdDocente(): number | null {
    const v = this.storage?.getItem(this.ID_DOC_KEY);
    return v ? Number(v) : null;
  }

  isLoggedIn(): boolean { return !!this.getToken(); }

  logout(): void {
    [this.TOKEN_KEY, this.EMAIL_KEY, this.NOMBRE_KEY, this.ROL_KEY, this.ID_DOC_KEY]
      .forEach(k => this.storage?.removeItem(k));
  }
}
