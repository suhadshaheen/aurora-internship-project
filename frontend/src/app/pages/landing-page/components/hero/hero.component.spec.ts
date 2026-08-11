import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { Hero } from './hero.component';
import { AuthActions } from '../../../login-page/store/auth.actions';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;
  let store: MockStore;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [provideMockStore({ initialState: {} }), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('continueAsGuest()', () => {
    it('should set the guest token in localStorage', () => {
      component.continueAsGuest();

      expect(localStorage.getItem('token')).toBe('guest-token');
    });

    it('should set the guest user object in localStorage', () => {
      component.continueAsGuest();

      const storedUser = JSON.parse(localStorage.getItem('user') ?? 'null');

      expect(storedUser).toEqual({
        id: 0,
        email: 'guest@auroratech.ps',
        userName: 'Guest',
        role: 'GUEST',
      });
    });

    it('should dispatch AuthActions.continueAsGuest()', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.continueAsGuest();

      expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.continueAsGuest());
    });

    it('should navigate to /guest-dashboard', () => {
      component.continueAsGuest();

      expect(navigateSpy).toHaveBeenCalledWith(['/guest-dashboard']);
    });
  });

  describe('template', () => {
    it('should call continueAsGuest() when the guest button is clicked', () => {
      const continueAsGuestSpy = jest.spyOn(component, 'continueAsGuest');

      const guestButton = fixture.debugElement.query(By.css('button.guest_btn'));

      expect(guestButton).toBeTruthy();

      guestButton.nativeElement.click();

      expect(continueAsGuestSpy).toHaveBeenCalled();
    });
  });
});