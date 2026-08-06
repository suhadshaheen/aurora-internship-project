import { Component } from '@angular/core';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';
import { SectionListComponent } from '../components/section-list/section-list.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { AddSectionComponent } from '../components/add-section/add-section.component';
@Component({
  selector: 'app-employee-dashboard',
  imports: [
    NavBarComponent,
    RouterOutlet,
    SectionListComponent,
    SideBarComponent,
    AddSectionComponent,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css',
})
export class EmployeeDashboardComponent {}
