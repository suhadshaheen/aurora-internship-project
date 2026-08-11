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

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let routerMock: { navigate: jest.Mock };
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
});
