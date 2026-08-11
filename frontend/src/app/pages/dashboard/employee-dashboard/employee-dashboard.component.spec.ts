import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';

import { EmployeeDashboardComponent } from './employee-dashboard.component';

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent],
      providers: [
        provideMockStore({
          initialState: {
            auth: { user: null, token: null, isLoggedIn: false, loading: false, error: null },
            category: { categories: [], loading: false, error: null },
          },
        }),
        provideRouter([]),
        {
          provide: ConfirmationService,
          useValue: { confirm: jest.fn(), close: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the @defer placeholder for the sections list before the viewport trigger fires', () => {
    fixture.detectChanges();

    const placeholder = fixture.debugElement.query(By.css('.sections-placeholder'));
    expect(placeholder).toBeTruthy();
    expect(placeholder.nativeElement.textContent).toContain(
      'Sections will load when you scroll down...',
    );
  });
});