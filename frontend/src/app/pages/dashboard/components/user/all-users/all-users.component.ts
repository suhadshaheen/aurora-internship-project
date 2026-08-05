import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { selectAllUsers, selectUsersLoading } from '../../../../../shared/userStore/user.selectors';
import { IUserRequest } from '../../../../../../models/userRequest.interface';
import { UserActions } from '../../../../../shared/userStore/user.actions';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-all-users',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ConfirmDialogModule,
    Tag,
  ],
  providers: [ConfirmationService],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css',
})
export class AllUsersComponent implements OnInit {
  private store = inject(Store);
  private confirmationService = inject(ConfirmationService);
  users = this.store.selectSignal(selectAllUsers);
  loading = this.store.selectSignal(selectUsersLoading);
  showAddDialog = false;
  newUser: IUserRequest = { userHandle: '', email: '', password: '', role: 'EMPLOYEE' };
  roles = [
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Guest', value: 'GUEST' },
  ];
  constructor() {}
  currentUserId!: number;
  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    this.currentUserId = Number(localStorage.getItem('userId'));
  }
  onAddUser(): void {
    this.newUser = { userHandle: '', email: '', password: '', role: 'EMPLOYEE' };
    this.showAddDialog = true;
  }
  onCancelAddUser(): void {
    this.showAddDialog = false;
  }
  onConfirmAddUser(): void {
    if (
      !this.newUser.userHandle.trim() ||
      !this.newUser.email.trim() ||
      !this.newUser.password.trim()
    ) {
      return;
    }
    this.store.dispatch(UserActions.addUser({ user: this.newUser }));
    this.showAddDialog = false;
  }
  onDeleteUser(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      accept: () => {
        this.store.dispatch(UserActions.deleteUser({ id }));
      },
    });
  }
}
