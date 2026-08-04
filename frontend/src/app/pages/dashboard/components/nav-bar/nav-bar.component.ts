import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { selectCurrentUser } from '../../../login-page/store/auth.selectors';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { selectCategories } from '../category/store/category.selectors';

@Component({
  selector: 'app-nav-bar',
  imports: [ToolbarModule, AvatarModule, ButtonModule, AsyncPipe],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  user$ = this.store.select(selectCurrentUser);
  categories$ = this.store.select(selectCategories);
  currentPageTitle = signal('Dashboard');

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const catParam = params.get('catId');
      const mine = params.get('mine') === 'true';
      const view = params.get('view');

      if (view === 'users') {
        this.currentPageTitle.set('All Users');
      } else if (catParam) {
        const catId = Number(catParam);
        this.categories$.subscribe((categories) => {
          const category = categories.find((item) => item.id === catId);
          this.currentPageTitle.set(category?.catName ?? 'Category');
        });
      } else if (mine) {
        this.currentPageTitle.set('My Sections');
      } else {
        this.currentPageTitle.set('Dashboard');
      }
    });
  }
}
