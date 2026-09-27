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
        Consequência: uma conta de estudante será criada e o convite será enviado uma única vez para
        <strong>{{ data.email }}</strong
        >.
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
      border-left: 0.25rem solid var(--eyes-color-primary);
      background: var(--eyes-color-primary-container);
      color: var(--eyes-color-on-primary-container);
      padding: var(--eyes-space-3) var(--eyes-space-4);
      line-height: var(--eyes-line-height-body);
    }
  `,
})
export class ApproveRequestDialogComponent {
  readonly data = inject<AccessRequest>(MAT_DIALOG_DATA);
}
