import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRequestService, MemberRequestCreate } from '../../services/member-request.service';
import { ViaCepService } from '../../services/viacep.service';
import { environment } from '../../../environments/environment';

declare const grecaptcha: any;

@Component({
  selector: 'app-public-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-register.component.html',
  styleUrl: './public-register.component.scss'
})
export class PublicRegisterComponent implements OnInit {
  formData: MemberRequestCreate = {
    name: '',
    email: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
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
    imageConsentGiven: false,
    emailConsentGiven: false,
    whatsappConsentGiven: false,
    recaptchaToken: ''
  };

  isLoading = false;
  isSuccess = false;
  errorMessage = '';
  isLoadingCep = false;

  // Photo upload
  selectedFile: File | null = null;
  photoPreview: string | null = null;

  maritalStatusOptions = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'Outro'
  ];

  genderOptions = ['Masculino', 'Feminino', 'Outro'];

  private recaptchaSiteKey = ''; // Será configurado no environment

  constructor(
    private memberRequestService: MemberRequestService,
    private viaCepService: ViaCepService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecaptchaScript();
    }
  }

  loadRecaptchaScript() {
    // Verifica se já existe
    if (document.getElementById('recaptcha-script')) return;

    const siteKey = environment.recaptchaSiteKey;
    if (!siteKey) {
      console.warn('reCAPTCHA site key não configurada');
      return;
    }

    this.recaptchaSiteKey = siteKey;

    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
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

    this.formData[field] = formatted;
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

    this.formData.zipCode = value;

    // Busca automaticamente quando completa 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      this.buscarCep();
    }
  }

  buscarCep() {
    const cep = this.formData.zipCode;
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return;
    }

    this.isLoadingCep = true;
    this.viaCepService.buscarCep(cep).subscribe({
      next: (address) => {
        if (address) {
          // Preenche os campos apenas se estiverem vazios
          if (!this.formData.street) this.formData.street = address.street;
          if (!this.formData.neighborhood) this.formData.neighborhood = address.neighborhood;
          if (!this.formData.city) this.formData.city = address.city;
          if (!this.formData.state) this.formData.state = address.state;
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
  }

  async submitForm() {
    // Validações
    if (!this.formData.name || this.formData.name.trim().length < 3) {
      this.errorMessage = 'O nome completo deve ter pelo menos 3 caracteres.';
      return;
    }

    if (!this.formData.email || !this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Digite um email válido.';
      return;
    }

    if (!this.formData.birthDate) {
      this.errorMessage = 'A data de nascimento é obrigatória.';
      return;
    }

    if (!this.formData.gender) {
      this.errorMessage = 'O gênero é obrigatório.';
      return;
    }

    if (!this.formData.maritalStatus) {
      this.errorMessage = 'O estado civil é obrigatório.';
      return;
    }

    if (!this.formData.occupation || !this.formData.occupation.trim()) {
      this.errorMessage = 'A profissão é obrigatória.';
      return;
    }

    const primaryPhoneClean = this.getPhoneNumbersOnly(this.formData.primaryPhone);
    if (!primaryPhoneClean || primaryPhoneClean.length < 10 || primaryPhoneClean.length > 11) {
      this.errorMessage = 'O telefone principal deve ter 10 ou 11 dígitos.';
      return;
    }

    // Validar telefone secundário se preenchido
    if (this.formData.secondaryPhone) {
      const secondaryClean = this.getPhoneNumbersOnly(this.formData.secondaryPhone);
      if (secondaryClean.length > 0 && (secondaryClean.length < 10 || secondaryClean.length > 11)) {
        this.errorMessage = 'O telefone secundário deve ter 10 ou 11 dígitos.';
        return;
      }
      if (primaryPhoneClean === secondaryClean) {
        this.errorMessage = 'O telefone secundário não pode ser igual ao principal.';
        return;
      }
    }

    // Validar CEP se preenchido
    if (this.formData.zipCode) {
      const zipClean = this.formData.zipCode.replace(/\D/g, '');
      if (zipClean.length > 0 && zipClean.length !== 8) {
        this.errorMessage = 'O CEP deve ter 8 dígitos.';
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Obter token do reCAPTCHA
      let recaptchaToken = '';
      if (this.recaptchaSiteKey && typeof grecaptcha !== 'undefined') {
        try {
          recaptchaToken = await grecaptcha.execute(this.recaptchaSiteKey, { action: 'register' });
        } catch (recaptchaError) {
          console.error('Erro ao obter token reCAPTCHA:', recaptchaError);
          // Continua sem token em desenvolvimento
        }
      }

      // Preparar dados
      const requestData: MemberRequestCreate = {
        ...this.formData,
        primaryPhone: this.getPhoneNumbersOnly(this.formData.primaryPhone),
        secondaryPhone: this.formData.secondaryPhone ? this.getPhoneNumbersOnly(this.formData.secondaryPhone) : undefined,
        emergencyContact: this.formData.emergencyContact ? this.getPhoneNumbersOnly(this.formData.emergencyContact) : undefined,
        zipCode: this.formData.zipCode ? this.formData.zipCode.replace(/\D/g, '') : undefined,
        photo: this.selectedFile || undefined,
        recaptchaToken: recaptchaToken
      };

      this.memberRequestService.createRequest(requestData).subscribe({
        next: (response) => {
          this.isSuccess = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao enviar solicitação:', error);
          if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Já existe um cadastro com este email.';
          } else if (error.status === 429) {
            this.errorMessage = 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.';
          } else {
            this.errorMessage = 'Erro ao enviar solicitação. Tente novamente.';
          }
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      this.errorMessage = 'Erro inesperado. Tente novamente.';
      this.isLoading = false;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
