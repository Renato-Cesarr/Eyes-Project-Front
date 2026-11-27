import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { catchError, firstValueFrom, of, startWith, Subject, switchMap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageShellComponent, SurfaceCardComponent } from '../../shared/ui';

type Camera = 'Interna' | 'USB';

interface SessionRecord {
  id: string;
  date: string;
  camera: Camera;
  duration: string | null;
  frames: number | null;
  alerts: number | null;
  summary: string;
  source: string;
}

interface ScanTotals {
  sessions: number;
  completedSessions: number;
  processedFrames: number;
  announcedEvents: number;
}

const STORAGE_KEY = 'eyes-manual-scan-sessions-v1';
const countFormat = new Intl.NumberFormat('pt-BR');
const historyUrl = `${environment.apiUrl}/v1/scan-history`;

function readManualSessions(): SessionRecord[] {
  try {
    const saved: unknown = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

@Component({
  selector: 'eyes-scan-sessions',
  templateUrl: './scan-sessions.component.html',
  styleUrl: './scan-sessions.component.scss',
  imports: [
    DatePipe,
    MatButtonModule,
    PageShellComponent,
    ReactiveFormsModule,
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanSessionsComponent {
  private readonly builder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly refreshTotals = new Subject<void>();
  private readonly refreshHistory = new Subject<void>();
  private readonly localRecords = readManualSessions();
  private pendingSave: { fingerprint: string; id: string } | undefined;
  protected readonly totals = toSignal(
    this.refreshTotals.pipe(
      startWith(undefined),
      switchMap(() =>
        this.http.get<ScanTotals>(`${environment.apiUrl}/v1/scan-sessions/aggregate`).pipe(
          timeout(12000),
          catchError(() => of(null)),
          startWith(undefined),
        ),
      ),
    ),
  );
  protected readonly records = toSignal(
    this.refreshHistory.pipe(
      startWith(undefined),
      switchMap(() =>
        this.http.get<SessionRecord[]>(historyUrl).pipe(
          timeout(12000),
          catchError(() => of(null)),
          startWith(undefined),
        ),
      ),
    ),
  );
  protected readonly showForm = signal(false);
  protected readonly status = signal('');
  protected readonly saveError = signal('');
  protected readonly importing = signal(false);
  protected readonly saving = signal(false);
  protected readonly importError = signal('');
  protected readonly pendingLocalRecords = computed(() => {
    const remote = this.records();
    if (!remote) return [];
    return this.localRecords.filter(
      (entry) =>
        !remote.some((record) => record.id === entry.id || this.sameDetails(record, entry)),
    );
  });

  protected readonly form = this.builder.group({
    date: this.builder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
    ]),
    camera: this.builder.nonNullable.control<Camera>('Interna'),
    minutes: this.builder.control<number | null>(null, [Validators.min(0), Validators.max(1440)]),
    frames: this.countField(),
    alerts: this.countField(),
    summary: this.builder.nonNullable.control('', [Validators.maxLength(240)]),
    source: this.builder.nonNullable.control('Registro manual'),
  });

  protected async save(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    const { date, camera, minutes, frames, alerts, summary, source } = this.form.getRawValue();
    const details = {
      date,
      camera,
      duration: minutes === null ? null : `${minutes} min`,
      frames,
      alerts,
      summary: summary.trim(),
      source,
    };
    const fingerprint = JSON.stringify(details);
    if (this.pendingSave?.fingerprint !== fingerprint) {
      this.pendingSave = { fingerprint, id: globalThis.crypto.randomUUID() };
    }
    this.saving.set(true);
    this.saveError.set('');
    this.status.set('');
    try {
      await this.persist({ id: this.pendingSave.id, ...details });
      this.pendingSave = undefined;
      this.form.reset();
      this.showForm.set(false);
      this.status.set('Sessão salva no histórico compartilhado.');
      this.reloadHistory();
    } catch {
      this.saveError.set('Não foi possível salvar a sessão. Confira os dados e tente novamente.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async importLocalRecords(): Promise<void> {
    if (this.importing()) return;
    this.importing.set(true);
    this.importError.set('');
    this.status.set('');
    try {
      for (const entry of this.pendingLocalRecords()) {
        const source = entry.summary.startsWith('Sessão simulada')
          ? 'Simulação'
          : 'Registro manual';
        await this.persist({ ...entry, source });
      }
      this.status.set('Registros importados para o histórico compartilhado.');
    } catch {
      this.importError.set('A importação foi interrompida. Você pode tentar novamente.');
    } finally {
      this.reloadHistory();
      this.importing.set(false);
    }
  }

  protected reloadHistory(): void {
    this.refreshHistory.next();
  }

  protected formatCount(value: number | null): string {
    return value === null ? '—' : countFormat.format(value);
  }

  protected reloadTotals(): void {
    this.refreshTotals.next();
  }

  private persist(entry: SessionRecord): Promise<SessionRecord> {
    return firstValueFrom(this.http.post<SessionRecord>(historyUrl, entry).pipe(timeout(12000)));
  }

  private sameDetails(a: SessionRecord, b: SessionRecord): boolean {
    return (
      a.date === b.date &&
      a.camera === b.camera &&
      a.duration === b.duration &&
      a.frames === b.frames &&
      a.alerts === b.alerts &&
      a.summary === b.summary
    );
  }

  private countField() {
    return this.builder.control<number | null>(null, [
      Validators.min(0),
      Validators.max(1000000),
      Validators.pattern(/^\d+$/),
    ]);
  }
}
