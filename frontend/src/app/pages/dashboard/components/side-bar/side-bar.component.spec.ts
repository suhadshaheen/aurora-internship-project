import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarComponent } from './side-bar.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ICategory } from '../../../../../models/category.interface';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { selectCurrentUser, selectUserRole } from '../../../login-page/store/auth.selectors';
import { selectCategories } from '../category/store/category.selectors';
import { Store } from '@ngrx/store';
import { CategoryActions } from '../category/store/category.actions';
import { AuthActions } from '../../../login-page/store/auth.actions';
import { QUERY_PARAMS, SIDEBAR_ROUTES } from './Sidebar.constants';
import { ConfirmationService } from 'primeng/api';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let routerMock: { navigate: jest.Mock };
  let confirmSpy: jest.SpyInstance;
  const mockCategory: ICategory = {
    id: 1,
    catName: 'Networking',
    dateCreated: '2026-08-01T10:30:00',
    createdBy: { id: 1, userHandle: 'suhad_sh', role: 'ADMIN' },
  };

  const queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));
  const createComponent = async () => {
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [SideBarComponent],
      providers: [
        provideMockStore({
          initialState: {},
          selectors: [
            {
              selector: selectCurrentUser,
              value: { id: 1, userHandle: 'suhad_sh', email: 'suhad@auroratech.ps', role: 'ADMIN' },
            },
            { selector: selectUserRole, value: 'ADMIN' },
            { selector: selectCategories, value: [mockCategory] },
          ],
        }),
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMapSubject.asObservable() },
        },
      ],
    }).compileComponents();
    store = TestBed.inject(Store) as MockStore;
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    confirmSpy = jest
      .spyOn(confirmationService, 'confirm')
      .mockImplementation(() => confirmationService);

    fixture.detectChanges();
  };
  beforeEach(async () => {
    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should dispatch loadCategories on construction', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(CategoryActions.loadCategories());
  });

  it('should expose categories from the store', () => {
    expect(component.categories()).toEqual([mockCategory]);
  });
  describe('toggleCategories', () => {
    it('should toggle categoriesOpen from false to true', () => {
      expect(component.categoriesOpen()).toBe(false);

      component.toggleCategories();

      expect(component.categoriesOpen()).toBe(true);
    });

    it('should toggle categoriesOpen back to false on second call', () => {
      component.toggleCategories();
      component.toggleCategories();

      expect(component.categoriesOpen()).toBe(false);
    });
  });
  describe('onAddCategory', () => {
    it('should reset newCategoryName and open the dialog', () => {
      component.newCategoryName = 'leftover text';
      component.showAddCategoryDialog = false;

      component.onAddCategory();

      expect(component.newCategoryName).toBe('');
      expect(component.showAddCategoryDialog).toBe(true);
    });
  });
  describe('onCancelAddCategory', () => {
    it('should close the dialog', () => {
      component.showAddCategoryDialog = true;

      component.onCancelAddCategory();

      expect(component.showAddCategoryDialog).toBe(false);
    });
  });
  describe('onConfirmAddCategory', () => {
    it('should dispatch addCategory with the trimmed name', () => {
      component.newCategoryName = '  QA Team  ';

      component.onConfirmAddCategory();

      expect(dispatchSpy).toHaveBeenCalledWith(
        CategoryActions.addCategory({ category: { catName: 'QA Team' } }),
      );
    });

    it('should close the dialog and reset the input on confirm', () => {
      component.newCategoryName = 'QA Team';
      component.showAddCategoryDialog = true;

      component.onConfirmAddCategory();

      expect(component.showAddCategoryDialog).toBe(false);
      expect(component.newCategoryName).toBe('');
    });

    it('should not dispatch when the name is empty', () => {
      component.newCategoryName = '';
      dispatchSpy.mockClear();

      component.onConfirmAddCategory();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch when the name is only whitespace', () => {
      component.newCategoryName = '   ';
      dispatchSpy.mockClear();

      component.onConfirmAddCategory();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not close the dialog when the name is empty', () => {
      component.newCategoryName = '';
      component.showAddCategoryDialog = true;

      component.onConfirmAddCategory();

      expect(component.showAddCategoryDialog).toBe(true);
    });
  });

  describe('onDeleteCategory', () => {
    it('should dispatch deleteCategory with the given id', () => {
      component.onDeleteCategory(5);

      expect(dispatchSpy).toHaveBeenCalledWith(CategoryActions.deleteCategory({ id: 5 }));
    });
  });
  describe('getDashboardRoute', () => {
    it('should return adminDashboard route when role is ADMIN', () => {
      expect(component.getDashboardRoute()).toBe(SIDEBAR_ROUTES.adminDashboard);
    });
  });

  describe('ngOnInit - query params', () => {
    it('should set activeCatId when catId param is present', () => {
      queryParamMapSubject.next(convertToParamMap({ catId: '3' }));

      expect(component.activeCatId()).toBe(3);
    });

    it('should set activeCatId to null when catId param is absent', () => {
      queryParamMapSubject.next(convertToParamMap({}));

      expect(component.activeCatId()).toBeNull();
    });

    it('should set isMineActive to true when mine=true', () => {
      queryParamMapSubject.next(convertToParamMap({ mine: 'true' }));

      expect(component.isMineActive()).toBe(true);
    });

    it('should set isMineActive to false when mine is absent', () => {
      queryParamMapSubject.next(convertToParamMap({}));

      expect(component.isMineActive()).toBe(false);
    });

    it('should set isUsersViewActive to true when view=users', () => {
      queryParamMapSubject.next(convertToParamMap({ view: 'users' }));

      expect(component.isUsersViewActive()).toBe(true);
    });

    it('should set isUsersViewActive to false when view is something else', () => {
      queryParamMapSubject.next(convertToParamMap({ view: 'other' }));

      expect(component.isUsersViewActive()).toBe(false);
    });

    it('should set isDashboardActive to true when no params are present', () => {
      queryParamMapSubject.next(convertToParamMap({}));

      expect(component.isDashboardActive()).toBe(true);
    });

    it('should set isDashboardActive to false when catId is present', () => {
      queryParamMapSubject.next(convertToParamMap({ catId: '1' }));

      expect(component.isDashboardActive()).toBe(false);
    });

    it('should set isDashboardActive to false when mine is present', () => {
      queryParamMapSubject.next(convertToParamMap({ mine: 'true' }));

      expect(component.isDashboardActive()).toBe(false);
    });

    it('should set isDashboardActive to false when view is present', () => {
      queryParamMapSubject.next(convertToParamMap({ view: 'users' }));

      expect(component.isDashboardActive()).toBe(false);
    });
  });

  describe('onDashboardClick', () => {
    it('should navigate to the dashboard route', () => {
      component.onDashboardClick();

      expect(routerMock.navigate).toHaveBeenCalledWith([SIDEBAR_ROUTES.adminDashboard]);
    });
  });

  describe('onMySectionsClick', () => {
    it('should navigate to the dashboard route with mine=true', () => {
      component.onMySectionsClick();

      expect(routerMock.navigate).toHaveBeenCalledWith([SIDEBAR_ROUTES.adminDashboard], {
        queryParams: { [QUERY_PARAMS.mine]: true },
      });
    });
  });

  describe('onCategoryClick', () => {
    it('should navigate to the dashboard route with the given catId', () => {
      component.onCategoryClick(7);

      expect(routerMock.navigate).toHaveBeenCalledWith([SIDEBAR_ROUTES.adminDashboard], {
        queryParams: { [QUERY_PARAMS.catId]: 7 },
      });
    });
  });

  describe('onAllUsersClick', () => {
    it('should navigate to the dashboard route with view=users', () => {
      component.onAllUsersClick();

      expect(routerMock.navigate).toHaveBeenCalledWith([SIDEBAR_ROUTES.adminDashboard], {
        queryParams: { [QUERY_PARAMS.view]: 'users' },
      });
    });
  });

  describe('onLogout', () => {
    it('should call confirmationService.confirm with the correct message', () => {
      const fakeEvent = { target: {} } as unknown as Event;

      component.onLogout(fakeEvent);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Are you sure you want to log out?',
          header: 'Confirm Logout',
        }),
      );
    });

    it('should dispatch logout and navigate to login when accepted', () => {
      const fakeEvent = { target: {} } as unknown as Event;

      component.onLogout(fakeEvent);

      const confirmCallArgs = confirmSpy.mock.calls[0][0];
      confirmCallArgs.accept();

      expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
      expect(routerMock.navigate).toHaveBeenCalledWith([SIDEBAR_ROUTES.login]);
    });

    it('should not dispatch logout when not accepted', () => {
      const fakeEvent = { target: {} } as unknown as Event;
      dispatchSpy.mockClear();

      component.onLogout(fakeEvent);
      // ما استدعينا accept()

      expect(dispatchSpy).not.toHaveBeenCalledWith(AuthActions.logout());
    });
  });

  describe('onBackToHome', () => {
    it('should dispatch logout and navigate to root', () => {
      component.onBackToHome();

      expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.logout());
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
