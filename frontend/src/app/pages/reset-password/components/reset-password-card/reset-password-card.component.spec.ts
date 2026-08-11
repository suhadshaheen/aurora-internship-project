import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { ResetPasswordCardComponent } from './reset-password-card.component';
import { AuthService } from '../../../../shared/services/auth.services';

describe('ResetPasswordCardComponent', () => {
  let component: ResetPasswordCardComponent;
  let comp: any;
  let fixture: ComponentFixture<ResetPasswordCardComponent>;

  let authServiceMock: { resetPassword: jest.Mock };
  let routerMock: { navigate: jest.Mock };
  let messageService: MessageService;
  let messageServiceAddSpy: jest.SpyInstance;

  const createComponent = async (
    queryParams: Record<string, string> = { token: 'valid-token' },
  ) => {
    authServiceMock = {
      resetPassword: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordCardComponent],
      providers: [
        MessageService,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => queryParams[key] ?? null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordCardComponent);

    component = fixture.componentInstance;
    comp = component;

    messageService = TestBed.inject(MessageService);
    messageServiceAddSpy = jest.spyOn(messageService, 'add');

    fixture.detectChanges();
  };

  beforeEach(async () => {
    await createComponent();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Password validation', () => {
    it('should be invalid when password is empty', () => {
      comp.model.set({
        newPassword: '',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is less than 8 characters', () => {
      comp.model.set({
        newPassword: 'Ab1',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is missing an uppercase letter', () => {
      comp.model.set({
        newPassword: 'abcdefg1',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is missing a number', () => {
      comp.model.set({
        newPassword: 'Abcdefgh',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be valid when password meets all requirements', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(true);
    });
  });

  describe('Password mismatch', () => {
    it('should be false when confirmPassword is empty', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: '',
      });

      fixture.detectChanges();

      expect(comp.passwordMismatch()).toBe(false);
    });

    it('should be true when passwords do not match', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: 'Abcdefg2',
      });

      fixture.detectChanges();

      expect(comp.passwordMismatch()).toBe(true);
    });

    it('should be false when passwords match exactly', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: 'Abcdefg1',
      });

      fixture.detectChanges();

      expect(comp.passwordMismatch()).toBe(false);
    });
  });

  describe('isFormValid', () => {
    it('should be true when password is strong and passwords match', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: 'Abcdefg1',
      });

      fixture.detectChanges();

      expect(comp.isFormValid()).toBe(true);
    });

    it('should be false when password is strong but passwords do not match', () => {
      comp.model.set({
        newPassword: 'Abcdefg1',
        confirmPassword: 'Abcdefg2',
      });

      fixture.detectChanges();

      expect(comp.isFormValid()).toBe(false);
    });

    it('should be false when password is weak even if passwords match', () => {
      comp.model.set({
        newPassword: 'weak',
        confirmPassword: 'weak',
      });

      fixture.detectChanges();

      expect(comp.isFormValid()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should prevent default form submission', () => {
      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(fakeEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not call authService.resetPassword when form is invalid', () => {
      comp.model.set({
        newPassword: 'weak',
        confirmPassword: 'weak',
      });

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - success', () => {
    const validModel = {
      newPassword: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    };

    it('should call authService.resetPassword when form is valid', () => {
      authServiceMock.resetPassword.mockReturnValue(of({ message: 'Success' }));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(authServiceMock.resetPassword).toHaveBeenCalled();
    });

    it('should call authService.resetPassword with the correct token and passwords', () => {
      authServiceMock.resetPassword.mockReturnValue(of({ message: 'Success' }));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
        'valid-token',
        'Abcdefg1',
        'Abcdefg1',
      );
    });

    it('should set isLoading to true while request is pending', () => {
      authServiceMock.resetPassword.mockReturnValue(new Observable(() => {}));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(comp.isLoading()).toBe(true);
    });

    it('should set isLoading back to false after success', () => {
      authServiceMock.resetPassword.mockReturnValue(of({ message: 'Success' }));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(comp.isLoading()).toBe(false);
    });

    it('should show a success toast message on success', () => {
      authServiceMock.resetPassword.mockReturnValue(of({ message: 'Password reset!' }));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(messageServiceAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          detail: 'Password reset!',
        }),
      );
    });

    it('should navigate to /login after 3 seconds on success', () => {
      jest.useFakeTimers();

      authServiceMock.resetPassword.mockReturnValue(of({ message: 'Success' }));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(routerMock.navigate).not.toHaveBeenCalled();

      jest.advanceTimersByTime(3000);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('onSubmit - error', () => {
    const validModel = {
      newPassword: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    };

    it('should set isLoading back to false on error', () => {
      authServiceMock.resetPassword.mockReturnValue(
        throwError(() => ({
          error: {
            message: 'Invalid or expired token',
          },
        })),
      );

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(comp.isLoading()).toBe(false);
    });

    it('should show an error toast with the backend message on error', () => {
      authServiceMock.resetPassword.mockReturnValue(
        throwError(() => ({
          error: {
            message: 'Invalid or expired token',
          },
        })),
      );

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(messageServiceAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Invalid or expired token',
        }),
      );
    });

    it('should show a default error message when backend provides none', () => {
      authServiceMock.resetPassword.mockReturnValue(throwError(() => ({})));

      comp.model.set(validModel);

      fixture.detectChanges();

      const fakeEvent = {
        preventDefault: jest.fn(),
      } as unknown as Event;

      comp.onSubmit(fakeEvent);

      expect(messageServiceAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Something went wrong. Please try again.',
        }),
      );
    });
  });
});
