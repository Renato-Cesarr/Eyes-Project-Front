import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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

const STORAGE_KEY = 'eyes-manual-scan-sessions-v1';
const countFormat = new Intl.NumberFormat('pt-BR');
const documented: readonly SessionRecord[] = [
  {
    id: 'usb-diagnostic',
    date: '2026-11-23',
    camera: 'USB',
    duration: '33 min 45 s',
    frames: 18834,
    alerts: 5,
    summary: 'Sessão de 23 para 24/11. p95 de processamento de 201,33 ms nos últimos 512 ciclos.',
    source: 'Diagnóstico local · Apêndice D',
  },
  {
    id: 'classroom',
    date: '2026-11-05',
    camera: 'USB',
    duration: 'Cerca de 20 min',
    frames: null,
    alerts: null,
    summary: 'Observação do funcionamento em sala de aula. O TCC inclui fotos do ambiente.',
    source: 'Observação em sala · TCC §8.4',
  },
  {
    id: 'phone-tts',
    date: '2026-09-16',
    camera: 'Interna',
    duration: null,
    frames: null,
    alerts: null,
    summary:
      'p95 de 685,66 ms da captura até o retorno de início da síntese, em quatro pares válidos.',
    source: 'Piloto de latência · TCC §8.3',
  },
  {
    id: 'phone-benchmark',
    date: '2026-08-21',
    camera: 'Interna',
    duration: null,
    frames: null,
    alerts: null,
    summary: 'Tempo médio de processamento de 94,51 ms por ciclo, em 300 ciclos.',
    source: 'Benchmark · TCC §8.3',
  },
];

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
  private readonly manual = signal<SessionRecord[]>(readManualSessions());
  protected readonly showForm = signal(false);
  protected readonly status = signal('');
  protected readonly saveError = signal('');
  protected readonly records = computed(() =>
    [...this.manual(), ...documented].sort((a, b) => b.date.localeCompare(a.date)),
  );

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
  });

  protected save(): void {
    if (this.form.invalid) return;
    const { date, camera, minutes, frames, alerts, summary } = this.form.getRawValue();
    const record: SessionRecord = {
      id: globalThis.crypto.randomUUID(),
      date,
      camera,
      duration: minutes === null ? null : `${minutes} min`,
      frames,
      alerts,
      summary: summary.trim(),
      source: 'Registro manual',
    };
    const updated = [record, ...readManualSessions()];

    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      this.saveError.set('O navegador não permitiu salvar. O formulário continua aberto.');
      return;
    }

    this.manual.set(updated);
    this.form.reset();
    this.saveError.set('');
    this.showForm.set(false);
    this.status.set('Sessão salva neste navegador.');
  }

  protected formatCount(value: number | null): string {
    return value === null ? '—' : countFormat.format(value);
  }

  private countField() {
    return this.builder.control<number | null>(null, [
      Validators.min(0),
      Validators.max(1000000),
      Validators.pattern(/^\d+$/),
    ]);
  }
}
