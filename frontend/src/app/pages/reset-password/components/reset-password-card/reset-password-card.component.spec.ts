import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { ResetPasswordCardComponent } from './reset-password-card.component';
import { AuthService } from '../../../../shared/services/auth.services';

describe('ResetPasswordCardComponent', () => {
  let component: ResetPasswordCardComponent;
  let comp: any; // نسخة "مفتوحة" لنفس الـ instance، للوصول لـ protected members بالاختبارات
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
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Password validation', () => {
    it('should be invalid when password is empty', () => {
      comp.model.set({ newPassword: '', confirmPassword: '' });
      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is less than 8 characters', () => {
      comp.model.set({ newPassword: 'Ab1', confirmPassword: '' });
      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is missing an uppercase letter', () => {
      comp.model.set({ newPassword: 'abcdefg1', confirmPassword: '' });
      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be invalid when password is missing a number', () => {
      comp.model.set({ newPassword: 'Abcdefgh', confirmPassword: '' });
      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(false);
    });

    it('should be valid when password meets all requirements', () => {
      comp.model.set({ newPassword: 'Abcdefg1', confirmPassword: '' });
      fixture.detectChanges();

      expect(comp.resetForm.newPassword().valid()).toBe(true);
    });
  });
});
