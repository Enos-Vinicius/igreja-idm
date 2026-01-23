import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Schedule {
  day: string;
  time: string;
  service: string;
}

interface Location {
  city: string;
  schedules: Schedule[];
  address?: string;
}

@Component({
  selector: 'app-schedule-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-section.component.html',
  styleUrl: './schedule-section.component.scss'
})
export class ScheduleSectionComponent {
  locations: Location[] = [
    {
      city: 'Uberaba',
      schedules: [
        { day: 'Quarta-feira', time: '19:30', service: 'Culto de Ensino' },
        { day: 'Domingo', time: '19:00', service: 'Culto de Celebração' }
      ]
    },
    {
      city: 'Conceição das Alagoas',
      schedules: [
        { day: 'Quinta-feira', time: '19:00', service: 'Culto de Oração' },
        { day: 'Domingo', time: '09:00', service: 'Culto Matutino' }
      ]
    }
  ];
}
