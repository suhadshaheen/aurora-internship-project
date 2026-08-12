import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { authGuard } from './auth.guard';
import { selectCurrentUser } from '../app/pages/login-page/store/auth.selectors';

describe('authGuard', () => {
  let store: MockStore;
  let routerMock: { navigate: jest.Mock };

  const runGuard = () => TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

  const setup = (user: any) => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: selectCurrentUser, value: user }],
        }),
        { provide: Router, useValue: routerMock },
      ],
    });

    store = TestBed.inject(Store) as MockStore;
  };

  it('should allow access when a user is logged in', async () => {
    setup({ id: 1, userHandle: 'suhad_sh', email: 'suhad@auroratech.ps', role: 'ADMIN' });

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to /login when no user is logged in', async () => {
    setup(null);

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
