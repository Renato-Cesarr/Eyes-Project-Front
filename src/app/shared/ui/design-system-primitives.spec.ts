import { TestBed } from '@angular/core/testing';
import { FeedbackBannerComponent } from './feedback-banner/feedback-banner.component';
import { IconComponent } from './icon/icon.component';
import { PageShellComponent } from './page-shell/page-shell.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { StateViewComponent } from './state-view/state-view.component';
import { StatusBadgeComponent } from './status-badge/status-badge.component';

describe('Eyes Design System primitives', () => {
  it('connects the page region to its visible heading', async () => {
    await TestBed.configureTestingModule({ imports: [PageShellComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PageShellComponent);
    fixture.componentRef.setInput('title', 'Usuários');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section');
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('Usuários');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('uses an alert region for errors', async () => {
    await TestBed.configureTestingModule({ imports: [FeedbackBannerComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FeedbackBannerComponent);
    fixture.componentRef.setInput('title', 'Falha ao salvar');
    fixture.componentRef.setInput('message', 'Tente novamente.');
    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('marks loading as busy without exposing the visual skeleton', async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent, StateViewComponent],
    }).compileComponents();
    const skeleton = TestBed.createComponent(SkeletonComponent);
    skeleton.detectChanges();
    expect(skeleton.nativeElement.querySelector('.skeleton').getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.nativeElement.querySelector('[role="status"]').textContent).toContain('Carregando');

    const state = TestBed.createComponent(StateViewComponent);
    state.componentRef.setInput('kind', 'loading');
    state.componentRef.setInput('title', 'Carregando usuários');
    state.componentRef.setInput('message', 'Aguarde.');
    state.detectChanges();
    expect(state.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('always exposes a text label for status', async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('label', 'Aprovado');
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aprovado');
  });

  it('hides redundant icons and labels standalone icons', async () => {
    await TestBed.configureTestingModule({ imports: [IconComponent] }).compileComponents();
    const decorative = TestBed.createComponent(IconComponent);
    decorative.componentRef.setInput('name', 'add');
    decorative.detectChanges();
    expect(decorative.nativeElement.querySelector('span').getAttribute('aria-hidden')).toBe('true');

    const informative = TestBed.createComponent(IconComponent);
    informative.componentRef.setInput('name', 'warning');
    informative.componentRef.setInput('label', 'Atenção');
    informative.detectChanges();
    expect(informative.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      'Atenção',
    );
  });
});
