import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';

import {
  selectCurrentUser,
  selectUserRole,
} from '../../../../pages/login-page/store/auth.selectors';
import { AuthActions } from '../../../../pages/login-page/store/auth.actions';
import { CategoryActions } from '../category/store/category.actions';
import { selectCategories } from '../category/store/category.selectors';
import { SIDEBAR_ROUTES, QUERY_PARAMS, USER_ROLES } from '../side-bar/Sidebar.constants';

@Component({
  selector: 'app-side-bar',
  imports: [
    DrawerModule,
    ButtonModule,
    AvatarModule,
    RippleModule,
    StyleClassModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    RouterModule,
    CommonModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent implements OnInit {
  store = inject(Store);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);

  currentUser = this.store.selectSignal(selectCurrentUser);
  userRole = this.store.selectSignal(selectUserRole);
  categories = this.store.selectSignal(selectCategories);
  isAdmin = computed(() => this.userRole() === USER_ROLES.admin);
  isGuest = computed(() => this.userRole() === USER_ROLES.guest);
  categoriesOpen = signal(false);

  activeCatId = signal<number | null>(null);
  isMineActive = signal(false);
  isDashboardActive = signal(false);

  showAddCategoryDialog = false;
  newCategoryName = '';

  constructor() {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  getDashboardRoute(): string {
    const role = this.userRole();
    if (role === USER_ROLES.admin) return SIDEBAR_ROUTES.adminDashboard;
    if (role === USER_ROLES.guest) return SIDEBAR_ROUTES.guestDashboard;
    return SIDEBAR_ROUTES.employeeDashboard;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const catParam = params.get(QUERY_PARAMS.catId);
      const mineParam = params.get(QUERY_PARAMS.mine) === 'true';

      this.activeCatId.set(catParam ? Number(catParam) : null);
      this.isMineActive.set(mineParam);
      this.isDashboardActive.set(!catParam && !mineParam);
    });
  }

  toggleCategories(): void {
    this.categoriesOpen.update((v) => !v);
  }

  onDashboardClick(): void {
    this.router.navigate([this.getDashboardRoute()]);
  }

  onMySectionsClick(): void {
    this.router.navigate([this.getDashboardRoute()], {
      queryParams: { [QUERY_PARAMS.mine]: true },
    });
  }

  onCategoryClick(id: number): void  {
    // TODO(TEMP-ID-RENAME): اسم البارامتر اختياري بس - القيمة هي id الكاتيجوري
    this.router.navigate([this.getDashboardRoute()], {
      queryParams: { [QUERY_PARAMS.catId]: id },
    });
  }

  onAddCategory(): void {
    this.newCategoryName = '';
    this.showAddCategoryDialog = true;
  }

  onCancelAddCategory(): void {
    this.showAddCategoryDialog = false;
  }

  onConfirmAddCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;

    // TODO(TEMP-ID-RENAME): ما عاد محتاجين نولد id يدوياً - json-server عم يولده
    // تلقائياً بما إنه الحقل الوحيد للـ identity هلق اسمه "id" فعلياً
    this.store.dispatch(
      CategoryActions.addCategory({
        category: {
          catName: name,
          userId: this.currentUser()?.id ?? '',
        },
      }),
    );

    this.showAddCategoryDialog = false;
    this.newCategoryName = '';
  }

  onDeleteCategory(id: number): void {
    // TODO(TEMP-ID-RENAME): رجّع catId مكان id
    this.store.dispatch(CategoryActions.deleteCategory({ id }));
  }

  onLogout(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to log out?',
      header: 'Confirm Logout',
      icon: 'pi pi-sign-out',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Logout',
        severity: 'danger',
      },
      accept: () => {
        this.store.dispatch(AuthActions.logout());
        this.router.navigate([SIDEBAR_ROUTES.login]);
      },
    });
  }

  onBackToHome(): void {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/']);
  }
}
