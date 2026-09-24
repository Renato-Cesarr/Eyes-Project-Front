import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { filter, switchMap, take } from 'rxjs';
import { createPtBrPaginatorIntl } from '../../../../../shared/i18n/pt-br-paginator-intl';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { userManagementErrorMessage } from '../../../application/user-management-error.mapper';
import { UserManagementFacade } from '../../../application/user-management.facade';
import {
  InviteUserCommand,
  ManagedUser,
  ManagedUserRole,
  SortDirection,
  UserSortField,
} from '../../../domain/models/managed-user.model';
import { InviteUserDialogComponent } from '../../components/invite-user-dialog/invite-user-dialog.component';
import {
  UserActionConfirmDialogComponent,
  UserActionConfirmDialogData,
} from '../../components/user-action-confirm-dialog/user-action-confirm-dialog.component';
import { UserDetailsDialogComponent } from '../../components/user-details-dialog/user-details-dialog.component';
import {
  formatManagedUserDate,
  managedUserRoleLabel,
  managedUserStatusClass,
  managedUserStatusLabel,
} from '../../user-management-presentation';

type AccountStatusFilter = '' | 'active' | 'inactive';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: createPtBrPaginatorIntl }],
})
export class UserListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  readonly facade = inject(UserManagementFacade);

  readonly displayedColumns = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];
  readonly pageSizeOptions = [10, 20, 50];
  readonly actionFeedback = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly roleLabel = managedUserRoleLabel;
  readonly statusLabel = managedUserStatusLabel;
  readonly statusClass = managedUserStatusClass;
  readonly formatDate = formatManagedUserDate;

  readonly filterForm = this.fb.nonNullable.group({
    search: ['', [Validators.maxLength(150)]],
    role: ['' as ManagedUserRole | ''],
    status: ['' as AccountStatusFilter],
    sortBy: ['NAME' as UserSortField],
    direction: ['ASC' as SortDirection],
  });

  ngOnInit(): void {
    this.facade.load();
  }

  applyFilters(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const filters = this.filterForm.getRawValue();
    this.clearActionFeedback();
    this.facade.load({
      page: 0,
      size: this.facade.pageSize(),
      sortBy: filters.sortBy,
      direction: filters.direction,
      search: filters.search,
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status ? { active: filters.status === 'active' } : {}),
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      role: '',
      status: '',
      sortBy: 'NAME',
      direction: 'ASC',
    });
    this.clearActionFeedback();
    this.facade.load({ page: 0, size: this.facade.pageSize(), sortBy: 'NAME', direction: 'ASC' });
  }

  changePage(event: PageEvent): void {
    this.facade.load({
      ...this.facade.query(),
      page: event.pageIndex,
      size: event.pageSize,
    });
  }

  openInvite(): void {
    this.clearActionFeedback();
    this.dialog
      .open<InviteUserDialogComponent, undefined, InviteUserCommand>(InviteUserDialogComponent, {
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        width: 'min(40rem, calc(100vw - 2rem))',
      })
      .afterClosed()
      .pipe(
        filter((command): command is InviteUserCommand => command !== undefined),
        switchMap((command) => this.facade.invite(command)),
        take(1),
      )
      .subscribe({
        next: () => this.completeAction('Convite enviado com sucesso.'),
        error: (error: unknown) => this.handleActionError(error, 'invite'),
      });
  }

  openDetails(user: ManagedUser): void {
    this.clearActionFeedback();
    this.facade
      .getById(user.id)
      .pipe(take(1))
      .subscribe({
        next: (details) => {
          this.dialog.open(UserDetailsDialogComponent, {
            data: details,
            autoFocus: 'dialog',
            restoreFocus: true,
            width: 'min(42rem, calc(100vw - 2rem))',
          });
        },
        error: (error: unknown) => this.handleActionError(error, 'details'),
      });
  }

  resendInvitation(user: ManagedUser): void {
    if (!user.invitationPending) {
      return;
    }

    this.confirm({
      title: 'Reenviar convite',
      message: `Enviar um novo link de ativação para ${user.email}?`,
      hint: 'O link anterior deixará de funcionar e o novo convite será válido por 48 horas.',
      confirmLabel: 'Reenviar convite',
    })
      .pipe(switchMap(() => this.facade.resendInvitation(user.id)))
      .subscribe({
        next: () => this.completeAction('Convite reenviado com sucesso.'),
        error: (error: unknown) => this.handleActionError(error, 'resend'),
      });
  }

  activate(user: ManagedUser): void {
    if (user.active || user.invitationPending) {
      return;
    }

    this.confirm({
      title: 'Ativar conta',
      message: `Ativar novamente a conta de ${user.name}?`,
      confirmLabel: 'Ativar conta',
    })
      .pipe(switchMap(() => this.facade.updateStatus(user, true)))
      .subscribe({
        next: () => this.completeAction('Conta ativada com sucesso.'),
        error: (error: unknown) => this.handleActionError(error, 'activate'),
      });
  }

  deactivate(user: ManagedUser): void {
    if (!user.active) {
      return;
    }

    this.confirm({
      title: 'Desativar conta',
      message: `Desativar a conta de ${user.name}?`,
      hint: 'O usuário perderá o acesso, mas seus dados e histórico serão preservados.',
      confirmLabel: 'Desativar conta',
      destructive: true,
    })
      .pipe(switchMap(() => this.facade.updateStatus(user, false)))
      .subscribe({
        next: () => this.completeAction('Conta desativada com sucesso.'),
        error: (error: unknown) => this.handleActionError(error, 'deactivate'),
      });
  }

  private confirm(data: UserActionConfirmDialogData) {
    this.clearActionFeedback();
    return this.dialog
      .open<UserActionConfirmDialogComponent, UserActionConfirmDialogData, boolean>(
        UserActionConfirmDialogComponent,
        {
          data,
          autoFocus: 'dialog',
          restoreFocus: true,
          width: 'min(40rem, calc(100vw - 2rem))',
        },
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        take(1),
      );
  }

  private completeAction(message: string): void {
    this.actionFeedback.set(message);
    this.actionError.set(null);
    this.toast.success(message);
    this.facade.reload();
  }

  private handleActionError(
    error: unknown,
    operation: 'details' | 'invite' | 'resend' | 'activate' | 'deactivate',
  ): void {
    const message = userManagementErrorMessage(error, operation);
    this.actionFeedback.set(null);
    this.actionError.set(message);
    this.toast.error(message);

    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 409)) {
      this.facade.reload();
    }
  }

  private clearActionFeedback(): void {
    this.actionFeedback.set(null);
    this.actionError.set(null);
  }
}
