import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { ScheduleSectionComponent } from './components/schedule-section/schedule-section.component';
import { EventSectionComponent } from './components/event-section/event-section.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeroBanner2Component } from './components/hero-banner2/hero-banner2.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeroBannerComponent,
    HeroBanner2Component,
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
