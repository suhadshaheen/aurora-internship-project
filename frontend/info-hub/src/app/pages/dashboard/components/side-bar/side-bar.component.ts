import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';

import {
  selectCurrentUser,
  selectUserRole,
} from '../../../../pages/login-page.component/store/auth.selectors';
import { AuthActions } from '../../../../pages/login-page.component/store/auth.actions';
import { CategoryActions } from '../category/store/category.actions';
import { selectCategories } from '../category/store/category.selectors';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    AvatarModule,
    RippleModule,
    StyleClassModule,
    ConfirmDialogModule,
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
  isMineActive = signal(false);
  currentUser = this.store.selectSignal(selectCurrentUser);
  userRole = this.store.selectSignal(selectUserRole);
  categories = this.store.selectSignal(selectCategories);
  isAdmin = computed(() => this.userRole() === 'admin');

  categoriesOpen = signal(false);
  activeCatId = signal<string | null>(null);
  isDashboardActive = signal(false);
  constructor() {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const catParam = params.get('catId');
      this.activeCatId.set(catParam ? catParam : null);
      this.isMineActive.set(params.get('mine') === 'true');
      this.isDashboardActive.set(!catParam && params.get('mine') !== 'true');
    });
  }

  toggleCategories(): void {
    this.categoriesOpen.update((v) => !v);
  }

  onAddCategory() {
    const name = prompt('Category name:');
    if (!name) return;
    this.store.dispatch(
      CategoryActions.addCategory({
        category: {
          catName: name,
          userId: this.currentUser()?.id ?? '',
        },
      }),
    );
  }
  onDashboardClick(): void {
    this.router.navigate(['/employee-dashboard']);
  }
  onDeleteCategory(catId: string) {
    this.store.dispatch(CategoryActions.deleteCategory({ catId }));
  }

  onCategoryClick(catId: string) {
    this.router.navigate(['/employee-dashboard'], { queryParams: { catId } });
  }
  onMySectionsClick(): void {
    this.router.navigate(['/employee-dashboard'], { queryParams: { mine: true } });
  }
  onLogout(event: Event) {
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
        this.router.navigate(['/login']);
      },
    });
  }
}
