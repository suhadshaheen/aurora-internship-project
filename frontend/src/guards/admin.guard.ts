import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';

import { selectUserRole } from '../app/pages/login-page/store/auth.selectors';
import { USER_ROLES } from '../app/pages/dashboard/components/side-bar/Sidebar.constants';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (role === USER_ROLES.admin) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
  );
};
