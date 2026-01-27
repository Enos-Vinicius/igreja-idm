import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MemberRequest {
  id?: number;
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  primaryPhone: string;
  secondaryPhone?: string;
  emergencyContact?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  photoUrl?: string;
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberRequestCreate {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  primaryPhone: string;
  secondaryPhone?: string;
  emergencyContact?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  photo?: File;
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;
  recaptchaToken: string;
}

export interface MemberRequestResponse {
  message: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class MemberRequestService {
  private readonly API_URL = `${environment.apiUrl}/member-requests`;

  constructor(private http: HttpClient) {}

  // Público - Auto-cadastro
  createRequest(data: MemberRequestCreate): Observable<MemberRequestResponse> {
    const formData = new FormData();

    // Campos obrigatórios
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('birthDate', data.birthDate);
    formData.append('gender', data.gender);
    formData.append('maritalStatus', data.maritalStatus);
    formData.append('occupation', data.occupation);
    formData.append('primaryPhone', data.primaryPhone);
    formData.append('recaptchaToken', data.recaptchaToken);

    // Campos opcionais
    if (data.secondaryPhone) formData.append('secondaryPhone', data.secondaryPhone);
    if (data.emergencyContact) formData.append('emergencyContact', data.emergencyContact);
    if (data.zipCode) formData.append('zipCode', data.zipCode);
    if (data.street) formData.append('street', data.street);
    if (data.number) formData.append('number', data.number);
    if (data.complement) formData.append('complement', data.complement);
    if (data.neighborhood) formData.append('neighborhood', data.neighborhood);
    if (data.city) formData.append('city', data.city);
    if (data.state) formData.append('state', data.state);
    if (data.photo) formData.append('photo', data.photo);
    if (data.imageConsentGiven !== undefined) formData.append('imageConsentGiven', String(data.imageConsentGiven));
    if (data.emailConsentGiven !== undefined) formData.append('emailConsentGiven', String(data.emailConsentGiven));
    if (data.whatsappConsentGiven !== undefined) formData.append('whatsappConsentGiven', String(data.whatsappConsentGiven));

    return this.http.post<MemberRequestResponse>(this.API_URL, formData);
  }

  // Admin - Listar solicitações
  getRequests(status?: string): Observable<MemberRequest[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<MemberRequest[]>(this.API_URL, { params });
  }

  // Admin - Obter detalhes
  getRequestById(id: number): Observable<MemberRequest> {
    return this.http.get<MemberRequest>(`${this.API_URL}/${id}`);
  }

  // Admin - Aprovar solicitação
  approveRequest(id: number): Observable<{ message: string; memberId: number }> {
    return this.http.put<{ message: string; memberId: number }>(`${this.API_URL}/${id}/approve`, {});
  }

  // Admin - Rejeitar solicitação
  rejectRequest(id: number, reason: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${id}/reject`, { reason });
  }

  // Admin - Editar solicitação
  updateRequest(id: number, data: Partial<MemberRequest>): Observable<MemberRequest> {
    return this.http.put<MemberRequest>(`${this.API_URL}/${id}`, data);
  }

  // Admin - Deletar solicitação
  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Admin - Contar pendentes
  getPendingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/pending/count`);
  }
}
