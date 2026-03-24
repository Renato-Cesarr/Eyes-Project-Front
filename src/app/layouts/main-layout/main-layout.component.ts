import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  private router = inject(Router);

  // States
  public isSidebarCollapsed = signal(false);
  public currentYear = new Date().getFullYear();

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  logout(): void {
    // Basic mock logout
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
