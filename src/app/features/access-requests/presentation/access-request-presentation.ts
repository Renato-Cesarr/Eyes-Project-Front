import { AccessRequestStatus } from '../domain/models/access-request.model';

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function accessRequestStatusLabel(status: AccessRequestStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente';
    case 'APPROVED':
      return 'Aprovada';
    case 'REJECTED':
      return 'Rejeitada';
  }
}

export function formatAccessRequestDate(value: string | null): string {
  if (!value) {
    return 'Não informado';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : DATE_TIME_FORMAT.format(date);
}
