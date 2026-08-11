import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoginFormComponent } from './login-form.component';
import { AuthActions } from '../../store/auth.actions';
import {
  selectAuthLoading,
  selectAuthError,
  selectIsLoggedIn,
  selectUserRole,
} from '../../store/auth.selectors';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let store: MockStore;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

  const initialState = {
    // adjust shape to match your real auth state slice
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent], // standalone component
      providers: [provideRouter([]), provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // default selector values before each test
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);
    store.overrideSelector(selectIsLoggedIn, false);
    store.overrideSelector(selectUserRole, null);

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit - redirect logic', () => {
    it('should NOT navigate if user is not logged in', () => {
      store.overrideSelector(selectIsLoggedIn, false);
      store.refreshState();

      fixture.detectChanges(); // triggers ngOnInit

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate to /admin-dashboard when logged in as ADMIN', () => {
      store.overrideSelector(selectIsLoggedIn, true);
      store.overrideSelector(selectUserRole, 'ADMIN');
      store.refreshState();

      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/admin-dashboard']);
    });

    it('should navigate to /employee-dashboard when logged in as a regular employee', () => {
      store.overrideSelector(selectIsLoggedIn, true);
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/employee-dashboard']);
    });

    it('should dispatch logout and NOT navigate when role is GUEST', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      store.overrideSelector(selectIsLoggedIn, true);
      store.overrideSelector(selectUserRole, 'GUEST');
      store.refreshState();

      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('isEmailDomainValid', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true when allowedDomain is empty (temporary behavior)', () => {
      component.allowedDomain = '';
      component.email = 'anything@whatever.com';

      expect(component.isEmailDomainValid()).toBe(true);
    });

    it('should return true when email ends with allowedDomain', () => {
      component.allowedDomain = '@company.com';
      component.email = 'user@company.com';

      expect(component.isEmailDomainValid()).toBe(true);
    });

    it('should return false when email does not end with allowedDomain', () => {
      component.allowedDomain = '@company.com';
      component.email = 'user@other.com';

      expect(component.isEmailDomainValid()).toBe(false);
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should NOT dispatch login action if email domain is invalid', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.allowedDomain = '@company.com';
      component.email = 'user@other.com';
      component.password = '123456';

      component.login();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch AuthActions.login with trimmed, lowercased email and password', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.allowedDomain = '';
      component.email = '  User@Example.com  ';
      component.password = 'secret123';

      component.login();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({
          email: 'user@example.com',
          password: 'secret123',
        }),
      );
    });
  });
});