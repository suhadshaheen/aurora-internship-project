import { Component } from '@angular/core';
import {NavBarComponent} from '../components/nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-employee-dashboard.component',
  imports: [NavBarComponent , RouterOutlet],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css',
})
export class EmployeeDashboardComponent {}
