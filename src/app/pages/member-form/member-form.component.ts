import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersService, Member } from '../../services/members.service';
import { ViaCepService } from '../../services/viacep.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss'
})
export class MemberFormComponent implements OnInit {
  member: Member = {
    name: '',
    email: '',
    birthDate: '',
    gender: '',
    occupation: '',
    maritalStatus: '',
    primaryPhone: '',
    secondaryPhone: '',
    emergencyContact: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    churchRole: 'Membro',
    membershipStatus: '',
    baptismDate: '',
    joinDate: '',
    imageConsentGiven: false,
    emailConsentGiven: false,
    whatsappConsentGiven: false,
    notes: ''
  };

  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  memberId: number | null = null;
  isLoadingCep = false;

  // Photo upload
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  isUploadingPhoto = false;

  churchRoleOptions = [
    'Membro',
    'Ministro de Louvor',
    'Lider',
    'Diácono',
    'Presbitero',
    'Pastor/a'
  ];

  maritalStatusOptions = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'Outro'
  ];

  genderOptions = ['Masculino', 'Feminino'];

  membershipStatusOptions = ['Ativo', 'Inativo', 'Visitante', 'Congregado'];

  constructor(
    private membersService: MembersService,
    private viaCepService: ViaCepService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.memberId = +params['id'];
        this.isEditMode = true;
        this.loadMember();
      }
    });
  }

  loadMember() {
    if (!this.memberId) return;

    this.isLoading = true;
    this.membersService.getMemberById(this.memberId).subscribe({
      next: (member) => {
        this.member = {
          ...member,
          birthDate: member.birthDate ? this.formatDateForInput(member.birthDate) : '',
          baptismDate: member.baptismDate ? this.formatDateForInput(member.baptismDate) : '',
          joinDate: member.joinDate ? this.formatDateForInput(member.joinDate) : '',
          primaryPhone: member.primaryPhone ? this.applyPhoneMask(member.primaryPhone) : '',
          secondaryPhone: member.secondaryPhone ? this.applyPhoneMask(member.secondaryPhone) : '',
          emergencyContact: member.emergencyContact ? this.applyPhoneMask(member.emergencyContact) : '',
          zipCode: member.zipCode ? this.applyZipCodeMask(member.zipCode) : ''
        };

        // Carregar preview da foto se existir
        if (member.photoUrl) {
          this.photoPreview = member.photoUrl;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.errorMessage = 'Erro ao carregar membro. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  applyPhoneMask(phone: string): string {
    const value = phone.replace(/\D/g, '');
    let formatted = '';

    if (value.length > 0) {
      formatted = '(' + value.substring(0, 2);

      if (value.length >= 3) {
        formatted += ') ';

        if (value.length <= 10) {
          formatted += value.substring(2, 6);
          if (value.length >= 7) {
            formatted += '-' + value.substring(6, 10);
          }
        } else {
          formatted += value.substring(2, 7);
          if (value.length >= 8) {
            formatted += '-' + value.substring(7, 11);
          }
        }
      }
    }

    return formatted;
  }

  applyZipCodeMask(zipCode: string): string {
    const value = zipCode.replace(/\D/g, '');
    if (value.length > 5) {
      return value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    return value;
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPhoneNumber(event: any, field: 'primaryPhone' | 'secondaryPhone' | 'emergencyContact') {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    let formatted = '';

    if (value.length > 0) {
      formatted = '(' + value.substring(0, 2);

      if (value.length >= 3) {
        formatted += ') ';

        if (value.length <= 10) {
          // Telefone fixo: (34) 3278-2875
          formatted += value.substring(2, 6);
          if (value.length >= 7) {
            formatted += '-' + value.substring(6, 10);
          }
        } else {
          // Celular: (34) 99278-2875
          formatted += value.substring(2, 7);
          if (value.length >= 8) {
            formatted += '-' + value.substring(7, 11);
          }
        }
      }
    }

    this.member[field] = formatted;
  }

  getPhoneNumbersOnly(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  formatZipCode(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5);
    }

    this.member.zipCode = value;

    // Busca automaticamente quando completa 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      this.buscarCep();
    }
  }

  buscarCep() {
    const cep = this.member.zipCode;
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return;
    }

    this.isLoadingCep = true;
    this.viaCepService.buscarCep(cep).subscribe({
      next: (address) => {
        if (address) {
          // Preenche os campos apenas se estiverem vazios
          if (!this.member.street) this.member.street = address.street;
          if (!this.member.neighborhood) this.member.neighborhood = address.neighborhood;
          if (!this.member.city) this.member.city = address.city;
          if (!this.member.state) this.member.state = address.state;
        } else {
          // CEP não encontrado ou inválido
          console.warn('CEP não encontrado');
        }
        this.isLoadingCep = false;
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.isLoadingCep = false;
      }
    });
  }

  saveMember() {
    // Validações de campos obrigatórios
    if (!this.member.name || !this.member.name.trim()) {
      this.errorMessage = 'O nome completo é obrigatório.';
      return;
    }

    if (!this.member.birthDate) {
      this.errorMessage = 'A data de nascimento é obrigatória.';
      return;
    }

    if (!this.member.maritalStatus) {
      this.errorMessage = 'O estado civil é obrigatório.';
      return;
    }

    // Validar se pelo menos um campo de endereço foi preenchido
    const hasAddress = this.member.street || this.member.city || this.member.zipCode;
    if (!hasAddress) {
      this.errorMessage = 'Preencha pelo menos um campo de endereço (CEP, Rua ou Cidade).';
      return;
    }

    // Validar se telefone secundário é diferente do principal
    if (this.member.primaryPhone && this.member.secondaryPhone) {
      const primaryClean = this.getPhoneNumbersOnly(this.member.primaryPhone);
      const secondaryClean = this.getPhoneNumbersOnly(this.member.secondaryPhone);

      if (primaryClean === secondaryClean) {
        this.errorMessage = 'O telefone secundário não pode ser igual ao telefone principal.';
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Preparar dados para envio (remover máscaras)
    const memberData = {
      ...this.member,
      primaryPhone: this.member.primaryPhone ? this.getPhoneNumbersOnly(this.member.primaryPhone) : '',
      secondaryPhone: this.member.secondaryPhone ? this.getPhoneNumbersOnly(this.member.secondaryPhone) : '',
      emergencyContact: this.member.emergencyContact ? this.getPhoneNumbersOnly(this.member.emergencyContact) : '',
      zipCode: this.member.zipCode ? this.member.zipCode.replace(/\D/g, '') : ''
    };

    if (this.isEditMode && this.memberId) {
      this.membersService.updateMember(this.memberId, memberData).subscribe({
        next: () => {
          // Fazer upload da foto se houver
          this.uploadPhotoIfNeeded(this.memberId!);
        },
        error: (error) => {
          console.error('Error updating member:', error);
          this.errorMessage = 'Erro ao atualizar membro. Tente novamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.membersService.createMember(memberData).subscribe({
        next: (createdMember) => {
          // Fazer upload da foto se houver
          if (createdMember.id) {
            this.uploadPhotoIfNeeded(createdMember.id);
          } else {
            this.isLoading = false;
            this.router.navigate(['/members']);
          }
        },
        error: (error) => {
          console.error('Error creating member:', error);
          this.errorMessage = 'Erro ao criar membro. Tente novamente.';
          this.isLoading = false;
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Tipo de arquivo inválido. Apenas JPEG, PNG e WebP são permitidos.';
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage = 'A imagem deve ter no máximo 5MB.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoPreview = null;

    // Se estiver editando e tinha uma foto, deletar do servidor
    if (this.isEditMode && this.memberId && this.member.photoUrl) {
      if (confirm('Deseja remover a foto deste membro?')) {
        this.isUploadingPhoto = true;
        this.membersService.deletePhoto(this.memberId).subscribe({
          next: () => {
            this.member.photoUrl = undefined;
            this.isUploadingPhoto = false;
          },
          error: (error) => {
            console.error('Error deleting photo:', error);
            this.errorMessage = 'Erro ao deletar foto. Tente novamente.';
            this.isUploadingPhoto = false;
          }
        });
      }
    }
  }

  uploadPhotoIfNeeded(memberId: number) {
    if (!this.selectedFile) {
      this.isLoading = false;
      this.router.navigate(['/members']);
      return;
    }

    this.isUploadingPhoto = true;
    this.membersService.uploadPhoto(memberId, this.selectedFile).subscribe({
      next: (response) => {
        this.isUploadingPhoto = false;
        this.isLoading = false;
        this.router.navigate(['/members']);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.errorMessage = 'Membro salvo, mas houve erro ao enviar a foto. Tente novamente.';
        this.isUploadingPhoto = false;
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/members']);
  }
}
