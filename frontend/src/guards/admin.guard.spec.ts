import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { firstValueFrom, of } from 'rxjs';

import { adminGuard } from './admin.guard';
import { selectUserRole } from '../app/pages/login-page/store/auth.selectors';

describe('adminGuard', () => {
  let store: MockStore;
  let routerMock: { navigate: jest.Mock };

  const runGuard = () => TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

  const setup = (role: string | null) => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: selectUserRole, value: role }],
        }),
        { provide: Router, useValue: routerMock },
      ],
    });

    store = TestBed.inject(Store) as MockStore;
  };

  it('should allow access when role is ADMIN', async () => {
    setup('ADMIN');

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to /login when role is not ADMIN', async () => {
    setup('EMPLOYEE');

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny access and navigate to /login when role is null', async () => {
    setup(null);

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
