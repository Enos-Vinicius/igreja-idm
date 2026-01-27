import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRequestService, MemberRequest } from '../../services/member-request.service';

@Component({
  selector: 'app-member-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-requests.component.html',
  styleUrl: './member-requests.component.scss'
})
export class MemberRequestsComponent implements OnInit {
  requests: MemberRequest[] = [];
  filteredRequests: MemberRequest[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  statusFilter: string = 'pending';
  searchTerm: string = '';

  // Modal
  showModal = false;
  selectedRequest: MemberRequest | null = null;
  modalMode: 'view' | 'reject' = 'view';
  rejectionReason = '';
  isProcessing = false;

  // Contadores
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  constructor(
    private memberRequestService: MemberRequestService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.errorMessage = '';

    this.memberRequestService.getRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.updateCounts();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar solicitações:', error);
        this.errorMessage = 'Erro ao carregar solicitações. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  updateCounts() {
    this.pendingCount = this.requests.filter(r => r.status === 'pending').length;
    this.approvedCount = this.requests.filter(r => r.status === 'approved').length;
    this.rejectedCount = this.requests.filter(r => r.status === 'rejected').length;
  }

  applyFilters() {
    let filtered = [...this.requests];

    // Filtro por status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    // Filtro por busca
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        (r.primaryPhone && r.primaryPhone.includes(term))
      );
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    this.filteredRequests = filtered;
  }

  onStatusFilterChange(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  openViewModal(request: MemberRequest) {
    this.selectedRequest = request;
    this.modalMode = 'view';
    this.showModal = true;
  }

  openRejectModal(request: MemberRequest) {
    this.selectedRequest = request;
    this.modalMode = 'reject';
    this.rejectionReason = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.rejectionReason = '';
    this.isProcessing = false;
  }

  approveRequest(request: MemberRequest) {
    if (!request.id) return;

    if (!confirm('Deseja aprovar esta solicitação? Um novo membro será criado automaticamente.')) {
      return;
    }

    this.isProcessing = true;
    this.memberRequestService.approveRequest(request.id).subscribe({
      next: (response) => {
        alert('Solicitação aprovada com sucesso! Membro criado.');
        this.closeModal();
        this.loadRequests();
      },
      error: (error) => {
        console.error('Erro ao aprovar solicitação:', error);
        alert('Erro ao aprovar solicitação. Tente novamente.');
        this.isProcessing = false;
      }
    });
  }

  rejectRequest() {
    if (!this.selectedRequest?.id) return;

    if (!this.rejectionReason.trim()) {
      alert('Informe o motivo da rejeição.');
      return;
    }

    this.isProcessing = true;
    this.memberRequestService.rejectRequest(this.selectedRequest.id, this.rejectionReason).subscribe({
      next: () => {
        alert('Solicitação rejeitada.');
        this.closeModal();
        this.loadRequests();
      },
      error: (error) => {
        console.error('Erro ao rejeitar solicitação:', error);
        alert('Erro ao rejeitar solicitação. Tente novamente.');
        this.isProcessing = false;
      }
    });
  }

  deleteRequest(request: MemberRequest) {
    if (!request.id) return;

    if (!confirm('Deseja excluir esta solicitação permanentemente?')) {
      return;
    }

    this.memberRequestService.deleteRequest(request.id).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (error) => {
        console.error('Erro ao excluir solicitação:', error);
        alert('Erro ao excluir solicitação. Tente novamente.');
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPhone(phone: string | undefined): string {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  formatBirthDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status || '-';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
