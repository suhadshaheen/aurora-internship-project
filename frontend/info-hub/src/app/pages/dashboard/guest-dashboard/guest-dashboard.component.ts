import { Component } from '@angular/core';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { SectionListComponent } from '../components/section-list/section-list.component';

@Component({
  selector: 'app-guest-dashboard.component',
  imports: [NavBarComponent, SideBarComponent, SectionListComponent],
  templateUrl: './guest-dashboard.component.html',
  styleUrl: './guest-dashboard.component.css',
})
export class GuestDashboardComponent {}
