import { Component, inject } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { selectCurrentUser } from '../../../login-page.component/store/auth.selectors';
import { Store } from '@ngrx/store';
import {AsyncPipe} from '@angular/common';
@Component({
  selector: 'app-nav-bar',
  imports: [ToolbarModule, AvatarModule, ButtonModule, AsyncPipe],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
   private store = inject(Store);
   user$ = this.store.select(selectCurrentUser);
}
