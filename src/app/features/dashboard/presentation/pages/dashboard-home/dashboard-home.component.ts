import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent {
  // Temporary mock data for greeting
  currentDate = new Date();
  adminName = 'Administrador Principal';
  
  // Mock system stats
  stats = [
    { label: 'Usuários Ativos', value: '1,240', trend: '+12%', isPositive: true },
    { label: 'Solicitações Pendentes', value: '38', trend: '-5%', isPositive: false },
    { label: 'Acessos Hoje', value: '8.4k', trend: '+22%', isPositive: true },
    { label: 'Alertas do Sistema', value: '2', trend: 'Crítico', isPositive: false, isWarning: true }
  ];
}
