import { Component } from '@angular/core';
import { SectionListComponent } from '../components/section-list/section-list.component';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';

@Component({
  selector: 'app-admin-dashboard.component',
  imports: [SectionListComponent, NavBarComponent, SideBarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {}
