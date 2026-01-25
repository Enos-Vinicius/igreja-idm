import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { ScheduleSectionComponent } from './components/schedule-section/schedule-section.component';
import { EventSectionComponent } from './components/event-section/event-section.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    HeroBannerComponent,
    AboutSectionComponent,
    ScheduleSectionComponent,
    EventSectionComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Igreja do Deus de Maravilhas';
}
