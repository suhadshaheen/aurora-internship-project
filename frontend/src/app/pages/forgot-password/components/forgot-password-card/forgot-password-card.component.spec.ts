import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { ForgotPasswordCard } from './forgot-password-card.component';
import { AuthService } from '../../../../shared/services/auth.services';

describe('ForgotPasswordCard', () => {
  let component: ForgotPasswordCard;
  let comp: any;
  let fixture: ComponentFixture<ForgotPasswordCard>;

  let authServiceMock: { forgotPassword: jest.Mock };
  let routerMock: { navigate: jest.Mock };
  let messageService: MessageService;
  let messageServiceAddSpy: jest.SpyInstance;

  const createComponent = async () => {
    authServiceMock = {
      forgotPassword: jest.fn(),
    };
    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordCard],
      providers: [
        MessageService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordCard);
    component = fixture.componentInstance;
    comp = component;

    messageService = TestBed.inject(MessageService);
    messageServiceAddSpy = jest.spyOn(messageService, 'add');

    fixture.detectChanges();
  };

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  beforeEach(async () => {
    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Email validation', () => {
    it('should not be invalid when email is empty and untouched', () => {
      comp.model.set({ email: '' });
      fixture.detectChanges();

      expect(comp.forgotForm.email().invalid()).toBe(false);
    });

    it('should be invalid when email format is wrong', () => {
      comp.model.set({ email: 'notanemail' });
      fixture.detectChanges();

      expect(comp.forgotForm.email().invalid()).toBe(true);
    });

    it('should be valid when email format is correct', () => {
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      expect(comp.forgotForm.email().invalid()).toBe(false);
    });
  });

  describe('Submit button state', () => {
    it('should disable the submit button when email is empty', () => {
      comp.model.set({ email: '' });
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should disable the submit button when email format is invalid', () => {
      comp.model.set({ email: 'notanemail' });
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should enable the submit button when email is valid', () => {
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  describe('onSubmit - invalid form', () => {
    it('should not call authService.forgotPassword when email is invalid', () => {
      comp.model.set({ email: 'notanemail' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - success', () => {
    it('should call authService.forgotPassword with the correct email', () => {
      authServiceMock.forgotPassword.mockReturnValue(of({ message: 'Check your inbox' }));
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('test@auroratech.ps');
    });

    it('should set isLoading back to false after success', () => {
      authServiceMock.forgotPassword.mockReturnValue(of({ message: 'Check your inbox' }));
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(comp.isLoading()).toBe(false);
    });

    it('should show a success toast message on success', () => {
      authServiceMock.forgotPassword.mockReturnValue(
        of({ message: 'Check your inbox for the reset link.' }),
      );
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(messageServiceAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          detail: 'Check your inbox for the reset link.',
        }),
      );
    });

    it('should navigate to /login after 3 seconds on success', () => {
      jest.useFakeTimers();
      authServiceMock.forgotPassword.mockReturnValue(of({ message: 'Check your inbox' }));
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(routerMock.navigate).not.toHaveBeenCalled();

      jest.advanceTimersByTime(3000);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);

      jest.useRealTimers();
    });
  });

  describe('onSubmit - error', () => {
    it('should set isLoading back to false on error', () => {
      authServiceMock.forgotPassword.mockReturnValue(
        throwError(() => ({ error: { message: 'Something failed' } })),
      );
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(comp.isLoading()).toBe(false);
    });

    it('should show an error toast with the backend message on error', () => {
      authServiceMock.forgotPassword.mockReturnValue(
        throwError(() => ({ error: { message: 'Email service unavailable' } })),
      );
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
      comp.onSubmit(fakeEvent);

      expect(messageServiceAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Email service unavailable',
        }),
      );
    });

    it('should show a default error message when backend provides none', () => {
      authServiceMock.forgotPassword.mockReturnValue(throwError(() => ({})));
      comp.model.set({ email: 'test@auroratech.ps' });
      fixture.detectChanges();

      const fakeEvent = { preventDefault: jest.fn() } as unknown as Event;
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
