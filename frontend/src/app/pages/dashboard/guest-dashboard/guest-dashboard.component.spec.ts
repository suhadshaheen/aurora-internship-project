import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { GuestDashboardComponent } from './guest-dashboard.component';
import { AuthActions } from '../../login-page/store/auth.actions';

describe('GuestDashboardComponent', () => {
  let component: GuestDashboardComponent;
  let fixture: ComponentFixture<GuestDashboardComponent>;
  let store: MockStore;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestDashboardComponent],
      providers: [
        provideMockStore({
          initialState: {
            auth: { user: null, token: null, isLoggedIn: false, loading: false, error: null },
            category: { categories: [], loading: false, error: null },
          },
        }),
        provideRouter([]),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(GuestDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goHome()', () => {
    it('should dispatch AuthActions.logout()', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.goHome();

      expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
    });

    it('should navigate to the home route ("/")', () => {
      component.goHome();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('template', () => {
    it('should show the @defer placeholder for the sections list before the viewport trigger fires', () => {
      fixture.detectChanges();

      const placeholder = fixture.debugElement.query(By.css('.sections-placeholder'));
      expect(placeholder).toBeTruthy();
      expect(placeholder.nativeElement.textContent).toContain(
        'Sections will load when you scroll down...',
      );
    });
  });
});