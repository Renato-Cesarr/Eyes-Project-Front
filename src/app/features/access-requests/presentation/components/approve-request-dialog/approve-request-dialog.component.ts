import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AccessRequest } from '../../../domain/models/access-request.model';

@Component({
  selector: 'app-approve-request-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Confirmar aprovação</h2>
    <mat-dialog-content>
      <p>
        Aprovar a solicitação de <strong>{{ data.name }}</strong
        >?
      </p>
      <p class="dialog-hint">
        Uma conta de estudante será criada e o convite será enviado uma única vez para
        {{ data.email }}.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">Aprovar e convidar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-hint {
      max-width: 32rem;
      color: #475569;
      line-height: 1.5;
    }
  `,
})
export class ApproveRequestDialogComponent {
  readonly data = inject<AccessRequest>(MAT_DIALOG_DATA);
}
