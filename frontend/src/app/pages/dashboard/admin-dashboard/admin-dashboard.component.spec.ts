import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { selectCurrentUser, selectUserRole } from '../../login-page/store/auth.selectors';
import { selectCategories } from '../components/category/store/category.selectors';
import { selectAllUsers, selectUsersLoading } from '../../../shared/userStore/user.selectors';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  const queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));

  const createComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideMockStore({
          initialState: {},
          selectors: [
            {
              selector: selectCurrentUser,
              value: { id: 1, userHandle: 'suhad_sh', email: 'suhad@auroratech.ps', role: 'ADMIN' },
            },
            { selector: selectUserRole, value: 'ADMIN' },
            { selector: selectCategories, value: [] },
            { selector: selectAllUsers, value: [] },
            { selector: selectUsersLoading, value: false },
          ],
        }),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMapSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    queryParamMapSubject.next(convertToParamMap({}));
    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isUsersView to true when view=users', () => {
      queryParamMapSubject.next(convertToParamMap({ view: 'users' }));

      expect(component.isUsersView()).toBe(true);
    });

    it('should set isUsersView to false when view is absent', () => {
      queryParamMapSubject.next(convertToParamMap({}));

      expect(component.isUsersView()).toBe(false);
    });

    it('should set isUsersView to false when view has a different value', () => {
      queryParamMapSubject.next(convertToParamMap({ view: 'sections' }));

      expect(component.isUsersView()).toBe(false);
    });
  });
});
