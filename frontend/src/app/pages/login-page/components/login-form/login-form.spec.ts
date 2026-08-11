import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoginFormComponent } from './login-form.component';
import {
  selectAuthLoading,
  selectAuthError,
  selectIsLoggedIn,
  selectUserRole,
} from '../../store/auth.selectors';
import { LOGIN_FORM_CONSTANTS } from '../login-form.constants';

describe('LoginFormComponent (template)', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let store: MockStore;
  let routerSpy: { navigate: jest.Mock };

  const initialState = {};

  beforeEach(async () => {
    routerSpy = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);
    store.overrideSelector(selectIsLoggedIn, false);
    store.overrideSelector(selectUserRole, null);

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit
  });

  function getSubmitButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button.login-btn')).nativeElement;
  }

  function getEmailInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('#email')).nativeElement;
  }

  function setInputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  it('submit button should be disabled when form is empty/invalid', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const button = getSubmitButton();
    expect(button.disabled).toBe(true);
  }));

  it('should show required/invalid email error message once email field is dirty and invalid', fakeAsync(() => {
    const emailInput = getEmailInput();
    setInputValue(emailInput, 'not-an-email');
    tick();
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain(
      LOGIN_FORM_CONSTANTS.inValidErrorMassage,
    );
  }));

  it('should show domain error message when email is valid but domain does not match', fakeAsync(() => {
    component.allowedDomain = '@company.com';

    const emailInput = getEmailInput();
    setInputValue(emailInput, 'user@other.com');
    tick();
    fixture.detectChanges();

    const errorMessages = fixture.debugElement
      .queryAll(By.css('.error-message'))
      .map((el) => el.nativeElement.textContent.trim());

    expect(errorMessages).toContain(LOGIN_FORM_CONSTANTS.domainErrorMassage);
  }));

  it('submit button should be enabled when form is valid and domain matches', fakeAsync(() => {
    component.allowedDomain = '';

    const emailInput = getEmailInput();
    setInputValue(emailInput, 'user@example.com');
    tick();
    fixture.detectChanges();

    // password field uses p-password (PrimeNG); set via ngModel directly
    component.password = 'secret123';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const button = getSubmitButton();
    expect(button.disabled).toBe(false);
  }));

  it('should call login() when the form is submitted', fakeAsync(() => {
    const loginSpy = jest.spyOn(component, 'login');

    component.email = 'user@example.com';
    component.password = 'secret123';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(loginSpy).toHaveBeenCalled();
  }));

  it('should display the store error message when error$ emits a value', fakeAsync(() => {
    store.overrideSelector(selectAuthError, 'Invalid credentials');
    store.refreshState();
    tick();
    fixture.detectChanges();

    const errorMessages = fixture.debugElement
      .queryAll(By.css('.error-message'))
      .map((el) => el.nativeElement.textContent.trim());

    expect(errorMessages).toContain('Invalid credentials');
  }));

  it('should NOT display any store error message when error$ is null', fakeAsync(() => {
    store.overrideSelector(selectAuthError, null);
    store.refreshState();
    tick();
    fixture.detectChanges();

    // only the field-level error-message elements (if any) should exist, not a store error
    const errorMessages = fixture.debugElement
      .queryAll(By.css('.error-message'))
      .map((el) => el.nativeElement.textContent.trim());

    expect(errorMessages).not.toContain('Invalid credentials');
  }));
});