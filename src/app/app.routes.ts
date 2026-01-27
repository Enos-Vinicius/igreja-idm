import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Auth Guard
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedValue()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// Admin Guard
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedValue() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/public-register/public-register.component').then(m => m.PublicRegisterComponent)
  },
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members/new',
    loadComponent: () => import('./pages/member-form/member-form.component').then(m => m.MemberFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members/edit/:id',
    loadComponent: () => import('./pages/member-form/member-form.component').then(m => m.MemberFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/solicitacoes',
    loadComponent: () => import('./pages/member-requests/member-requests.component').then(m => m.MemberRequestsComponent),
    canActivate: [adminGuard]
  }
];
