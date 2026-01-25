import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Member {
  id?: number;
  name: string;
  email?: string;
  birthDate?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  emergencyContact?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;

  // Address fields
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address?: string; // legacy field

  // Church-related fields
  baptismDate?: string;
  membershipStatus?: string;
  joinDate?: string;
  churchRole?: string;

  // Consent fields
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;

  // Photo
  photoUrl?: string;

  // Metadata
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private readonly API_URL = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.API_URL);
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.API_URL}/${id}`);
  }

  createMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.API_URL, member);
  }

  updateMember(id: number, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.API_URL}/${id}`, member);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadPhoto(memberId: number, file: File): Observable<{ message: string; photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ message: string; photoUrl: string }>(`${this.API_URL}/${memberId}/photo`, formData);
  }

  deletePhoto(memberId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${memberId}/photo`);
  }
}
