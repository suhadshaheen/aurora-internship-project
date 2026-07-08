import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth.actions';
import { selectAuthLoading, selectAuthError, selectIsLoggedIn } from '../../store/auth.selectors';
@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
    RouterLink,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})

 export class LoginFormComponent {
  email: string = '';
  password: string = '';

    private store = inject(Store);
    
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);


  login(): void {
    this.store.dispatch(
      AuthActions.login({
        email: this.email,
        password: this.password
      })
    );
  }
}
  