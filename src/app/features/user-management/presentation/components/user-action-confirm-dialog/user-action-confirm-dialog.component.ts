import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface UserActionConfirmDialogData {
  title: string;
  message: string;
  hint?: string;
  confirmLabel: string;
  destructive?: boolean;
}

@Component({
  selector: 'app-user-action-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      @if (data.hint) {
        <p class="dialog-hint">{{ data.hint }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">Cancelar</button>
      <button
        mat-flat-button
        type="button"
        [class.destructive-action]="data.destructive"
        [mat-dialog-close]="true"
      >
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      max-width: 36rem;
      line-height: var(--eyes-line-height-body);
    }
    .dialog-hint {
      border-left: 0.25rem solid var(--eyes-color-warning);
      background: var(--eyes-color-surface-variant);
      color: var(--eyes-color-on-surface-variant);
      padding: var(--eyes-space-3) var(--eyes-space-4);
    }
    .destructive-action {
      background: var(--eyes-color-error);
      color: var(--eyes-color-on-error);
    }
  `,
})
export class UserActionConfirmDialogComponent {
  readonly data = inject<UserActionConfirmDialogData>(MAT_DIALOG_DATA);
}
