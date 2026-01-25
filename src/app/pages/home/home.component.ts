import { Component } from '@angular/core';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { HistorySectionComponent } from '../../components/history-section/history-section.component';
import { VersesSectionComponent } from '../../components/verses-section/verses-section.component';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { ScheduleSectionComponent } from '../../components/schedule-section/schedule-section.component';
import { PrayerRequestSectionComponent } from '../../components/prayer-request-section/prayer-request-section.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroBannerComponent,
    AboutSectionComponent,
    HistorySectionComponent,
    VersesSectionComponent,
    ProjectsSectionComponent,
    ScheduleSectionComponent,
    PrayerRequestSectionComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
