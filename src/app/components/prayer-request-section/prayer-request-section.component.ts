import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prayer-request-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prayer-request-section.component.html',
  styleUrl: './prayer-request-section.component.scss'
})
export class PrayerRequestSectionComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;

  async onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    try {
      // Aqui você pode integrar com um serviço de envio de email
      // Por enquanto, vou simular o envio
      const emailData = {
        to: 'idmigreja@gmail.com',
        subject: `Pedido de Oração - ${this.formData.name}`,
        body: `
          Nome: ${this.formData.name}
          Email: ${this.formData.email}
          Telefone: ${this.formData.phone || 'Não informado'}

          Mensagem:
          ${this.formData.message}
        `
      };

      console.log('Email a ser enviado:', emailData);

      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.showSuccessMessage = true;
      this.resetForm();
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      this.showErrorMessage = true;
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }
}
