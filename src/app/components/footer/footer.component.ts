import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks: SocialLink[] = [
    { icon: 'pi-facebook', url: '#', label: 'Facebook' },
    { icon: 'pi-instagram', url: '#', label: 'Instagram' },
    { icon: 'pi-youtube', url: '#', label: 'YouTube' },
    { icon: 'pi-whatsapp', url: '#', label: 'WhatsApp' }
  ];

  quickLinks = [
    { label: 'Início', url: '#' },
    { label: 'Sobre', url: '#about' },
    { label: 'Horários', url: '#schedule' },
    { label: 'Eventos', url: '#events' },
    { label: 'Contato', url: '#contact' }
  ];
}
