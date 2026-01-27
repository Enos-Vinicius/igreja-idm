import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private readonly API_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<AddressData | null> {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return of(null);
    }

    return this.http.get<ViaCepResponse>(`${this.API_URL}/${cepLimpo}/json/`).pipe(
      map(response => {
        // Verifica se houve erro na consulta
        if (response.erro) {
          return null;
        }

        // Retorna os dados formatados
        return {
          street: response.logradouro || '',
          neighborhood: response.bairro || '',
          city: response.localidade || '',
          state: response.uf || ''
        };
      }),
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        return of(null);
      })
    );
  }
}
