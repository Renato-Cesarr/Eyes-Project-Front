import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AccessRequest } from '../../../domain/models/access-request.model';
import {
  accessRequestStatusLabel,
  formatAccessRequestDate,
} from '../../access-request-presentation';

@Component({
  selector: 'app-request-details-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Detalhes da solicitação</h2>
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
          <dt>Estado</dt>
          <dd>{{ statusLabel(data.status) }}</dd>
        </div>
        <div>
          <dt>Motivo</dt>
          <dd>{{ data.reason || 'Não informado' }}</dd>
        </div>
        <div>
          <dt>Solicitada em</dt>
          <dd>{{ formatDate(data.createdAt) }}</dd>
        </div>
        @if (data.decidedAt) {
          <div>
            <dt>Decidida em</dt>
            <dd>{{ formatDate(data.decidedAt) }}</dd>
          </div>
        }
        @if (data.decisionReason) {
          <div>
            <dt>Justificativa da decisão</dt>
            <dd>{{ data.decisionReason }}</dd>
          </div>
        }
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
export class RequestDetailsDialogComponent {
  readonly data = inject<AccessRequest>(MAT_DIALOG_DATA);
  readonly statusLabel = accessRequestStatusLabel;
  readonly formatDate = formatAccessRequestDate;
}
