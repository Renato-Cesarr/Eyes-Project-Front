import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ManagedUser } from '../../../domain/models/managed-user.model';
import {
  formatManagedUserDate,
  managedUserRoleLabel,
  managedUserStatusLabel,
} from '../../user-management-presentation';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Detalhes do usuário</h2>
    <mat-dialog-content>
      <dl class="details-list">
        <div>
          <dt>Nome</dt>
          <dd>{{ data.name }}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{{ data.email }}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{{ roleLabel(data.role) }}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{{ statusLabel(data) }}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{{ formatDate(data.createdAt) }}</dd>
        </div>
        <div>
          <dt>Atualizado em</dt>
          <dd>{{ formatDate(data.updatedAt) }}</dd>
        </div>
      </dl>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button type="button" mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .details-list {
      display: grid;
      min-width: min(34rem, 75vw);
      margin: 0;
    }
    .details-list div {
      display: grid;
      grid-template-columns: minmax(8rem, 0.35fr) 1fr;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
    }
    dt {
      color: #475569;
      font-weight: 700;
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    @media (max-width: 36rem) {
      .details-list div {
        grid-template-columns: 1fr;
        gap: 0.25rem;
      }
    }
  `,
})
export class UserDetailsDialogComponent {
  readonly data = inject<ManagedUser>(MAT_DIALOG_DATA);
  readonly roleLabel = managedUserRoleLabel;
  readonly statusLabel = managedUserStatusLabel;
  readonly formatDate = formatManagedUserDate;
}
