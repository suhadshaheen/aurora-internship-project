import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';

import { AllUsersComponent } from './all-users.component';
import { UserActions } from '../../../../../shared/userStore/user.actions';
import { selectAllUsers, selectUsersLoading } from '../../../../../shared/userStore/user.selectors';
import { IUser } from '../../../../../../models/user.interface';

describe('AllUsersComponent', () => {
  let component: AllUsersComponent;
  let fixture: ComponentFixture<AllUsersComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let confirmationServiceMock: { confirm: jest.Mock };
  let messageService: MessageService;
  let messageServiceAddSpy: jest.SpyInstance;
  let actionsSubject: Subject<any>;
  let confirmSpy: jest.SpyInstance;

  const mockUsers: IUser[] = [
    { id: 1, userHandle: 'suhad_sh', email: 'suhad@auroratech.ps', role: 'ADMIN' } as IUser,
    { id: 2, userHandle: 'sana_A', email: 'sana@auroratech.ps', role: 'EMPLOYEE' } as IUser,
  ];

  const createComponent = async () => {
    confirmationServiceMock = { confirm: jest.fn() };
    actionsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [AllUsersComponent],
      providers: [
        provideMockStore({
          initialState: {},
          selectors: [
            { selector: selectAllUsers, value: mockUsers },
            { selector: selectUsersLoading, value: false },
          ],
        }),
        provideMockActions(() => actionsSubject),
        { provide: ConfirmationService, useValue: confirmationServiceMock },
        MessageService,
      ],
    }).compileComponents();

    store = TestBed.inject(Store) as MockStore;
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AllUsersComponent);
    component = fixture.componentInstance;
    messageService = fixture.debugElement.injector.get(MessageService);
    messageServiceAddSpy = jest.spyOn(messageService, 'add');
    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    confirmSpy = jest
      .spyOn(confirmationService, 'confirm')
      .mockImplementation(() => confirmationService);
  };

  beforeEach(async () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        userHandle: 'suhad_sh',
        email: 'suhad@auroratech.ps',
        role: 'ADMIN',
      }),
    );

    await createComponent();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch loadUsers', () => {
      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(UserActions.loadUsers());
    });

    it('should set currentUserId from localStorage', () => {
      fixture.detectChanges();

      expect(component.currentUserId).toBe(1);
    });

    it('should set currentUserId to 0 when localStorage has no user', () => {
      localStorage.removeItem('user');

      fixture.detectChanges();

      expect(component.currentUserId).toBe(0);
    });

    it('should show an error toast when deleteUserFailure is dispatched', () => {
      fixture.detectChanges();

      actionsSubject.next(UserActions.deleteUserFailure({ error: 'Cannot delete this user' }));

      expect(messageServiceAddSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Delete failed',
        detail: 'Cannot delete this user',
      });
    });
  });

  describe('users and loading signals', () => {
    it('should expose users from the store', () => {
      fixture.detectChanges();

      expect(component.users()).toEqual(mockUsers);
    });

    it('should expose the loading flag from the store', () => {
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });
  });

  describe('onAddUser', () => {
    it('should reset newUser and open the dialog', () => {
      fixture.detectChanges();

      component.newUser = { userHandle: 'x', email: 'x@x.com', password: 'x', role: 'ADMIN' };
      component.showAddDialog = false;

      component.onAddUser();

      expect(component.newUser).toEqual({
        userHandle: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
      });
      expect(component.showAddDialog).toBe(true);
    });
  });

  describe('onCancelAddUser', () => {
    it('should close the dialog', () => {
      fixture.detectChanges();

      component.showAddDialog = true;

      component.onCancelAddUser();

      expect(component.showAddDialog).toBe(false);
    });
  });

  describe('onConfirmAddUser', () => {
    it('should dispatch addUser and close the dialog when all fields are filled', () => {
      fixture.detectChanges();

      component.newUser = {
        userHandle: 'newUser',
        email: 'new@auroratech.ps',
        password: 'Abcdefg1',
        role: 'EMPLOYEE',
      };
      component.showAddDialog = true;

      component.onConfirmAddUser();

      expect(dispatchSpy).toHaveBeenCalledWith(UserActions.addUser({ user: component.newUser }));
      expect(component.showAddDialog).toBe(false);
    });

    it('should not dispatch when userHandle is empty', () => {
      fixture.detectChanges();
      dispatchSpy.mockClear();

      component.newUser = { userHandle: '  ', email: 'a@a.com', password: '123', role: 'EMPLOYEE' };

      component.onConfirmAddUser();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch when email is empty', () => {
      fixture.detectChanges();
      dispatchSpy.mockClear();

      component.newUser = { userHandle: 'name', email: '  ', password: '123', role: 'EMPLOYEE' };

      component.onConfirmAddUser();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch when password is empty', () => {
      fixture.detectChanges();
      dispatchSpy.mockClear();

      component.newUser = {
        userHandle: 'name',
        email: 'a@a.com',
        password: '  ',
        role: 'EMPLOYEE',
      };

      component.onConfirmAddUser();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not close the dialog when validation fails', () => {
      fixture.detectChanges();

      component.newUser = { userHandle: '', email: '', password: '', role: 'EMPLOYEE' };
      component.showAddDialog = true;

      component.onConfirmAddUser();

      expect(component.showAddDialog).toBe(true);
    });
  });

  describe('onDeleteUser', () => {
    it('should show an error toast and not open confirm dialog when deleting self', () => {
      fixture.detectChanges();
      component.currentUserId = 1;

      const fakeEvent = { target: {} } as unknown as Event;

      component.onDeleteUser(fakeEvent, 1);

      expect(messageServiceAddSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Action not allowed',
        detail: 'You cannot delete yourself.',
      });
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch deleteUser when attempting to delete self', () => {
      fixture.detectChanges();
      component.currentUserId = 1;
      dispatchSpy.mockClear();

      const fakeEvent = { target: {} } as unknown as Event;

      component.onDeleteUser(fakeEvent, 1);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
    it('should call confirmationService.confirm with the correct message', () => {
      fixture.detectChanges();

      const fakeEvent = { target: {} } as unknown as Event;

      component.onDeleteUser(fakeEvent, 2);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Are you sure you want to delete this user? This action cannot be undone.',
          header: 'Confirm Deletion',
        }),
      );
    });

    it('should dispatch deleteUser when the confirmation is accepted', () => {
      fixture.detectChanges();

      const fakeEvent = { target: {} } as unknown as Event;

      component.onDeleteUser(fakeEvent, 2);

      const confirmCallArgs = confirmSpy.mock.calls[0][0];
      confirmCallArgs.accept();

      expect(dispatchSpy).toHaveBeenCalledWith(UserActions.deleteUser({ id: 2 }));
    });

    it('should not dispatch deleteUser when confirmation is not accepted', () => {
      fixture.detectChanges();
      dispatchSpy.mockClear();

      const fakeEvent = { target: {} } as unknown as Event;

      component.onDeleteUser(fakeEvent, 2);

      expect(dispatchSpy).not.toHaveBeenCalledWith(UserActions.deleteUser({ id: 2 }));
    });
  });
});
