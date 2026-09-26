import { Routes } from '@angular/router';
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
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Resumo administrativo | Eyes Project',
        data: { navigationLabel: 'Resumo' },
        loadComponent: () =>
          import('./features/dashboard/presentation/pages/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'requests',
        title: 'Solicitações de acesso | Eyes Project',
        data: { navigationLabel: 'Solicitações' },
        loadComponent: () =>
          import('./features/access-requests/presentation/pages/access-request-list/access-request-list.component').then(
            (m) => m.AccessRequestListComponent,
          ),
      },
      {
        path: 'users',
        title: 'Gestão de usuários | Eyes Project',
        data: { navigationLabel: 'Usuários' },
        loadComponent: () =>
          import('./features/user-management/presentation/pages/user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: 'audit',
        title: 'Auditoria | Eyes Project',
        data: { navigationLabel: 'Auditoria' },
        loadComponent: () =>
          import('./features/audit/presentation/pages/audit-log-list/audit-log-list.component').then(
            (m) => m.AuditLogListComponent,
          ),
      },
      {
        path: 'design-system',
        title: 'Design System | Eyes Project',
        data: { navigationLabel: 'Design System' },
        loadComponent: () =>
          import('./features/design-system/presentation/design-system-catalog.component').then(
            (m) => m.DesignSystemCatalogComponent,
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
