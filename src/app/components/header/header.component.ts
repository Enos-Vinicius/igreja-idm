import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService, CurrentUser } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LoginModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  showLoginModal = false;
  showUserMenu = false;
  showMobileMenu = false;
  isAuthenticated = false;
  currentUser: CurrentUser | null = null;
  isHomePage = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Detecta mudanças de rota para saber se estamos na home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkIfHomePage();
    });
  }

  private checkIfHomePage(): void {
    const url = this.router.url;
    // Considera home page se for "/" ou "/#alguma-coisa" (âncoras da landing)
    this.isHomePage = url === '/' || url === '' || url.startsWith('/#');
  }

  ngOnInit() {
    // Inicializa o estado da página
    this.checkIfHomePage();

    this.authService.isAuthenticated().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    this.authService.getCurrentUser().subscribe(
      user => this.currentUser = user
    );
  }

  getUserInitials(): string {
    if (!this.currentUser?.member?.name) return 'U';
    const names = this.currentUser.member.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  getUserDisplayName(): string {
    return this.currentUser?.member?.name || this.currentUser?.email || 'Usuário';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  }

  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  navigateToMembers() {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.router.navigate(['/members']);
  }

  navigateToUsers() {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.router.navigate(['/users']);
  }

  logout() {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
