import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/presentation/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/presentation/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'setup-password',
    loadComponent: () => import('./features/auth/presentation/pages/setup-password/setup-password.component').then(m => m.SetupPasswordComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/presentation/pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      // Default child redirects to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login' // Basic fallback
  }
];
