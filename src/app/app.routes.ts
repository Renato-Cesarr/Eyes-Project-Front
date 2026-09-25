import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'solicitar-acesso',
    loadComponent: () =>
      import('./features/auth/presentation/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'setup-password',
    loadComponent: () =>
      import('./features/auth/presentation/pages/setup-password/setup-password.component').then(
        (m) => m.SetupPasswordComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/presentation/pages/forgot-password/forgot-password').then(
        (m) => m.ForgotPassword,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/presentation/pages/reset-password/reset-password').then(
        (m) => m.ResetPassword,
      ),
  },
  {
    path: 'acesso-negado',
    loadComponent: () =>
      import('./features/auth/presentation/pages/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/presentation/pages/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/access-requests/presentation/pages/access-request-list/access-request-list.component').then(
            (m) => m.AccessRequestListComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/user-management/presentation/pages/user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/presentation/pages/audit-log-list/audit-log-list.component').then(
            (m) => m.AuditLogListComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
