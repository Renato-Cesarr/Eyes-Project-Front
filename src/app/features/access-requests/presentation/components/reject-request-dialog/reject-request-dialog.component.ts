import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AccessRequest } from '../../../domain/models/access-request.model';

@Component({
  selector: 'app-reject-request-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Rejeitar solicitação</h2>
    <mat-dialog-content>
      <p>
        Informe uma justificativa para a solicitação de <strong>{{ data.name }}</strong
        >.
      </p>
      <form [formGroup]="form" id="reject-request-form" (ngSubmit)="submit()" novalidate>
        <mat-form-field appearance="outline" class="reason-field">
          <mat-label>Justificativa</mat-label>
          <textarea
            matInput
            formControlName="reason"
            rows="4"
            maxlength="500"
            aria-describedby="reject-reason-hint"
          ></textarea>
          <mat-hint id="reject-reason-hint" align="end">
            {{ form.controls.reason.value.length }}/500
          </mat-hint>
          @if (form.controls.reason.hasError('required')) {
            <mat-error>A justificativa é obrigatória.</mat-error>
          }
          @if (form.controls.reason.hasError('maxlength')) {
            <mat-error>Use no máximo 500 caracteres.</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button type="submit" form="reject-request-form">Confirmar rejeição</button>
    </mat-dialog-actions>
  `,
  styles: `
    .reason-field {
      width: 100%;
      min-width: min(30rem, 70vw);
      margin-top: 0.75rem;
    }
  `,
})
export class RejectRequestDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RejectRequestDialogComponent, string | null>);
  readonly data = inject<AccessRequest>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  submit(): void {
    const reason = this.form.controls.reason.value.trim();
    this.form.controls.reason.setValue(reason, { emitEvent: false });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(reason);
  }
}
