import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardHomeComponent } from './dashboard-home.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DashboardHomeComponent', () => {
  let component: DashboardHomeComponent;
  let fixture: ComponentFixture<DashboardHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set greeting based on time (morning)', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0)); // 10:00 AM
    component.updateTime();
    expect(component.greeting).toBe('Bom dia');
  });

  it('should set greeting based on time (afternoon)', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 15, 0)); // 3:00 PM
    component.updateTime();
    expect(component.greeting).toBe('Boa tarde');
  });

  it('should set greeting based on time (night)', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 20, 0)); // 8:00 PM
    component.updateTime();
    expect(component.greeting).toBe('Boa noite');
  });

  it('should format current date string correctly', () => {
    const testDate = new Date(2024, 0, 1); // Monday, Jan 1st 2024
    vi.setSystemTime(testDate);
    component.updateTime();
    
    // Capitalized first letter of long date string in pt-BR
    expect(component.currentDateStr).toBeTruthy();
    expect(typeof component.currentDateStr).toBe('string');
  });

  it('should update time every minute', fakeAsync(() => {
    const updateSpy = vi.spyOn(component, 'updateTime');
    component.ngOnInit();
    
    tick(60001); // 60 seconds
    expect(updateSpy).toHaveBeenCalled();
    
    component.ngOnDestroy();
  }));
});
