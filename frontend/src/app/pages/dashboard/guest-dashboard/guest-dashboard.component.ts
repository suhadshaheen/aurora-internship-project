import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { SectionListComponent } from '../components/section-list/section-list.component';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AuthActions } from '../../login-page/store/auth.actions';
@Component({
  selector: 'app-guest-dashboard.component',
  imports: [NavBarComponent, SideBarComponent, SectionListComponent],
  templateUrl: './guest-dashboard.component.html',
  styleUrl: './guest-dashboard.component.css',
})
export class GuestDashboardComponent {
  private store = inject(Store);
  private router = inject(Router);

  goHome(): void {
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/']);
  }
}
