import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionListComponent } from '../components/section-list/section-list.component';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { AddSectionComponent } from '../components/add-section/add-section.component';
import { AllUsersComponent } from '../components/user/all-users/all-users.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    SectionListComponent,
    NavBarComponent,
    SideBarComponent,
    AddSectionComponent,
    AllUsersComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);

  isUsersView = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.isUsersView.set(params.get('view') === 'users');
    });
  }
}
