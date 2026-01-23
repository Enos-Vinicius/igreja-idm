import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-section.component.html',
  styleUrl: './event-section.component.scss'
})
export class EventSectionComponent {
  highlights = [
    {
      icon: 'pi-clock',
      value: '72',
      unit: 'horas',
      label: 'de oração contínua'
    },
    {
      icon: 'pi-heart',
      value: '120',
      unit: 'minutos',
      label: 'de adoração'
    },
    {
      icon: 'pi-users',
      value: '1',
      unit: 'propósito',
      label: 'reverenciar a Cristo'
    }
  ];
}
