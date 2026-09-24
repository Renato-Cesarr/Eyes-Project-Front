import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InviteUserCommand } from '../../../domain/models/managed-user.model';

@Component({
  selector: 'app-invite-user-dialog',
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
    <h2 mat-dialog-title>Convidar usuário</h2>
    <mat-dialog-content>
      <p class="dialog-introduction">
        A conta será criada como estudante e ficará inativa até a definição da senha pelo link
        enviado por e-mail.
      </p>

      <form id="invite-user-form" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="name" maxlength="150" autocomplete="name" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>Informe o nome.</mat-error>
          } @else if (form.controls.name.hasError('minlength')) {
            <mat-error>O nome deve ter pelo menos 3 caracteres.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>E-mail</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            maxlength="150"
            autocomplete="email"
          />
          @if (form.controls.email.hasError('required')) {
            <mat-error>Informe o e-mail.</mat-error>
          } @else if (form.controls.email.hasError('email')) {
            <mat-error>Informe um e-mail válido.</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="undefined">Cancelar</button>
      <button mat-flat-button type="submit" form="invite-user-form">Criar e enviar convite</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-introduction {
      max-width: 35rem;
      margin-top: 0;
      color: #475569;
      line-height: 1.5;
    }
    form {
      display: grid;
      min-width: min(34rem, 75vw);
      gap: 0.25rem;
    }
  `,
})
export class InviteUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InviteUserDialogComponent, InviteUserCommand>);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  submit(): void {
    const rawValue = this.form.getRawValue();
    this.form.setValue({
      name: rawValue.name.trim(),
      email: rawValue.email.trim().toLowerCase(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close(value);
  }
}
