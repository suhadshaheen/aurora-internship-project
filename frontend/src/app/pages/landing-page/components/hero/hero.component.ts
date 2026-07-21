import { Component ,inject} from '@angular/core';
import { CardModule } from 'primeng/card';
import { RouterLink , Router} from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../login-page/store/auth.actions';

@Component({
  selector: 'app-hero',
  imports: [CardModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class Hero {
  readonly title = "Your team's collective intelligence, organized.";

  readonly description =
    "Centralize documentation, onboard faster, and keep your team aligned — all in one place.";

  readonly loginText = "Log In";

  readonly guestText = "Continue as a Guest";

  readonly arrow = "->";
    private store = inject(Store);
  private router = inject(Router);


  continueAsGuest(): void {
  const guestUser = {
    id: 0,
    email: 'guest@auroratech.ps',
    userName: 'Guest',
    role: 'guest'
  };

  localStorage.setItem('token', 'guest-token');
  localStorage.setItem('user', JSON.stringify(guestUser));

  this.store.dispatch(AuthActions.continueAsGuest());

  this.router.navigate(['/guest-dashboard']);
}
}
