import { Component, inject ,OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterLink ,Router} from '@angular/router';
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

 export class LoginFormComponent implements OnInit{
    private router = inject(Router);
    private store = inject(Store);

  email: string = '';
  password: string = '';

  allowedDomain: string = '@auroratech.ps';

    
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngOnInit(): void {
  this.isLoggedIn$.subscribe((isLoggedIn) => {
    if (isLoggedIn) {
      this.router.navigate(['/employee-dashboard']);
    }
  });
}
  
  isEmailDomainValid(): boolean {
    return this.email.endsWith(this.allowedDomain);
  }

  login(): void {
  if (!this.isEmailDomainValid()) {
    return;
  }

  this.store.dispatch(
    AuthActions.login({
      email: this.email.trim().toLowerCase(),
      password: this.password
    })
  );
}
}
  