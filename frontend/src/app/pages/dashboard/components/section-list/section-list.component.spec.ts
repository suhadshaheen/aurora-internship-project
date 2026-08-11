import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';

// dompurify's default export doesn't resolve reliably under Jest's CJS/ESM
// interop, causing `DOMPurify.sanitize` to be undefined at runtime. We mock
// it here (test-only) as a pass-through so sanitizeContent() doesn't throw,
// without touching the component's source code.
jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: (content: string) => content,
  },
}));

import { SectionListComponent } from './section-list.component';
import { SectionActions } from '../section/store/section.actions';
import {
  selectAllSections,
  selectSectionLoading,
  selectSectionError,
  selectSectionsByCategoryId,
  selectSectionsByUserId,
} from '../section/store/section.selectors';
import { selectCurrentUser, selectUserRole } from '../../../login-page/store/auth.selectors';
import { ISection } from '../../../../../models/section.interface';
import { AuthUser } from '../../../login-page/store/auth.state';

describe('SectionListComponent', () => {
  let component: SectionListComponent;
  let fixture: ComponentFixture<SectionListComponent>;
  let store: MockStore;

  const queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));

  const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser =>
    ({
      id: 1,
      email: 'user@example.com',
      userName: 'Test User',
      role: 'USER',
      ...overrides,
    }) as AuthUser;

  const makeSection = (overrides: Partial<ISection> = {}): ISection =>
    ({
      id: 1,
      title: 'Section title',
      content: '<p>content</p>',
      visibility: true,
      important: false,
      createdAt: new Date().toISOString(),
      createdBy: { id: 1 },
      category: { id: 1, catName: 'General' },
      documents: [],
      ...overrides,
    }) as unknown as ISection;

  beforeEach(async () => {
    queryParamMapSubject.next(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [SectionListComponent],
      providers: [
        provideMockStore({
          initialState: {
            comment: { comments: [], selectedComment: null, loading: false, error: null },
          },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectAllSections, []);
    store.overrideSelector(selectSectionLoading, false);
    store.overrideSelector(selectSectionError, null);
    store.overrideSelector(selectCurrentUser, makeUser());
    store.overrideSelector(selectUserRole, 'USER');

    fixture = TestBed.createComponent(SectionListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch SectionActions.loadSections()', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(SectionActions.loadSections());
    });
  });

  describe('visibleSections$ (buildDisplaySections filtering)', () => {
    it('should show only visible sections for a regular USER role', (done) => {
      const sections = [
        makeSection({ id: 1, visibility: true }),
        makeSection({ id: 2, visibility: false }),
      ];
      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(1);
        done();
      });
    });

    it('should show hidden sections too when role is ADMIN', (done) => {
      const sections = [
        makeSection({ id: 1, visibility: true }),
        makeSection({ id: 2, visibility: false }),
      ];
      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectUserRole, 'ADMIN');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result.length).toBe(2);
        done();
      });
    });

    it('should show hidden sections too when role is EMPLOYEE', (done) => {
      const sections = [
        makeSection({ id: 1, visibility: true }),
        makeSection({ id: 2, visibility: false }),
      ];
      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectUserRole, 'EMPLOYEE');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result.length).toBe(2);
        done();
      });
    });

    it('should mark isOwn=true and canModify=true for the current user\'s own section', (done) => {
      const currentUser = makeUser({ id: 5 });
      const sections = [makeSection({ id: 1, visibility: true, createdBy: { id: 5 } as any })];

      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result[0].isOwn).toBe(true);
        expect(result[0].canModify).toBe(true);
        done();
      });
    });

    it('should mark isOwn=false and canModify=false for another user\'s section when role is USER', (done) => {
      const currentUser = makeUser({ id: 5 });
      const sections = [makeSection({ id: 1, visibility: true, createdBy: { id: 999 } as any })];

      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result[0].isOwn).toBe(false);
        expect(result[0].canModify).toBe(false);
        done();
      });
    });

    it('should mark canModify=true for ADMIN even on sections they do not own', (done) => {
      const currentUser = makeUser({ id: 5 });
      const sections = [makeSection({ id: 1, visibility: true, createdBy: { id: 999 } as any })];

      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'ADMIN');
      store.refreshState();

      fixture.detectChanges();

      component.visibleSections$.subscribe((result) => {
        expect(result[0].isOwn).toBe(false);
        expect(result[0].canModify).toBe(true);
        done();
      });
    });
  });

  describe('Lightbox', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set lightboxUrl when clicking on an IMG element', () => {
      const img = document.createElement('img');
      img.src = 'https://example.com/photo.png';

      const event = { target: img } as unknown as MouseEvent;
      component.onContentClick(event);

      expect(component.lightboxUrl).toBe(img.src);
    });

    it('should NOT set lightboxUrl when clicking on a non-IMG element', () => {
      const div = document.createElement('div');

      const event = { target: div } as unknown as MouseEvent;
      component.onContentClick(event);

      expect(component.lightboxUrl).toBeNull();
    });

    it('closeLightbox() should reset lightboxUrl to null', () => {
      component.lightboxUrl = 'https://example.com/photo.png';

      component.closeLightbox();

      expect(component.lightboxUrl).toBeNull();
    });

    it('onEscape() should close the lightbox', () => {
      component.lightboxUrl = 'https://example.com/photo.png';

      component.onEscape();

      expect(component.lightboxUrl).toBeNull();
    });
  });

  describe('Edit dialog', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('startEdit() should populate fields and open the dialog', () => {
      const section = {
        ...makeSection({ id: 7, title: 'My Title', content: 'My content' }),
        isOwn: true,
        canModify: true,
        safeContent: 'safe' as any,
      };

      component.startEdit(section);

      expect(component.editingSection).toBe(section);
      expect(component.editTitle).toBe('My Title');
      expect(component.editContent).toBe('My content');
      expect(component.editDocuments).toEqual([]);
      expect(component.editDialogVisible).toBe(true);
    });

    it('cancelEdit() should reset all edit state', () => {
      component.editingSection = { ...makeSection() } as any;
      component.editTitle = 'x';
      component.editContent = 'y';
      component.editDocuments = [new File([], 'a.txt')];
      component.editDialogVisible = true;

      component.cancelEdit();

      expect(component.editingSection).toBeNull();
      expect(component.editTitle).toBe('');
      expect(component.editContent).toBe('');
      expect(component.editDocuments).toEqual([]);
      expect(component.editDialogVisible).toBe(false);
    });

    it('onEditDialogVisibleChange(false) should call cancelEdit()', () => {
      const cancelSpy = jest.spyOn(component, 'cancelEdit');

      component.onEditDialogVisibleChange(false);

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('onEditDialogVisibleChange(true) should NOT call cancelEdit()', () => {
      const cancelSpy = jest.spyOn(component, 'cancelEdit');

      component.onEditDialogVisibleChange(true);

      expect(cancelSpy).not.toHaveBeenCalled();
    });

    it('onEditDocumentsSelected() should append selected files and reset the input', () => {
      const file = new File(['content'], 'doc.pdf');
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      input.value = 'C:\\fakepath\\doc.pdf';

      const event = { target: input } as unknown as Event;
      component.onEditDocumentsSelected(event);

      expect(component.editDocuments).toEqual([file]);
      expect(input.value).toBe('');
    });

    it('removeEditDocument() should remove the file at the given index', () => {
      const fileA = new File([], 'a.txt');
      const fileB = new File([], 'b.txt');
      component.editDocuments = [fileA, fileB];

      component.removeEditDocument(0);

      expect(component.editDocuments).toEqual([fileB]);
    });

    it('removeExistingDocument() should dispatch deleteSectionDocument and optimistically update editingSection', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const section = {
        ...makeSection({ id: 3 }),
        documents: [
          { id: 10, fileName: 'a.pdf' } as any,
          { id: 20, fileName: 'b.pdf' } as any,
        ],
      } as any;
      component.editingSection = section;

      component.removeExistingDocument(10);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.deleteSectionDocument({ sectionId: 3, documentId: 10 }),
      );
      expect(component.editingSection?.documents).toEqual([{ id: 20, fileName: 'b.pdf' }]);
    });

    it('removeExistingDocument() should do nothing if there is no editingSection', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editingSection = null;

      component.removeExistingDocument(10);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('submitEdit() should NOT dispatch if title is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editingSection = { ...makeSection() } as any;
      component.editTitle = '   ';
      component.editContent = 'valid content';

      component.submitEdit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('submitEdit() should NOT dispatch if content is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editingSection = { ...makeSection() } as any;
      component.editTitle = 'valid title';
      component.editContent = '   ';

      component.submitEdit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('submitEdit() should NOT dispatch if there is no editingSection', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.editingSection = null;
      component.editTitle = 'valid title';
      component.editContent = 'valid content';

      component.submitEdit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('submitEdit() should dispatch updateSection with trimmed values and reset state', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const section = {
        ...makeSection({ id: 9, visibility: true }),
        category: { id: 2, catName: 'Cat' },
      } as any;

      component.editingSection = section;
      component.editTitle = '  New Title  ';
      component.editContent = '  New Content  ';
      component.editDocuments = [];

      component.submitEdit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.updateSection({
          id: 9,
          title: 'New Title',
          content: 'New Content',
          categoryId: 2,
          visibility: true,
          documents: [],
        }),
      );

      expect(component.editingSection).toBeNull();
      expect(component.editTitle).toBe('');
      expect(component.editContent).toBe('');
      expect(component.editDialogVisible).toBe(false);
    });
  });

  describe('Direct CRUD actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deleteSection() should dispatch SectionActions.deleteSection with the given id', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.deleteSection(42);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.deleteSection({ sectionId: 42 }),
      );
    });

    it('toggleImportant() should dispatch setSectionImportant with the flipped value (false -> true)', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const section = { ...makeSection({ id: 4, important: false }) } as any;

      component.toggleImportant(section);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.setSectionImportant({ id: 4, important: true }),
      );
    });

    it('toggleImportant() should dispatch setSectionImportant with the flipped value (true -> false)', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const section = { ...makeSection({ id: 4, important: true }) } as any;

      component.toggleImportant(section);

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.setSectionImportant({ id: 4, important: false }),
      );
    });
  });

  describe('documentUrl()', () => {
    it('should build the full document URL using environment.apiUrl', () => {
      const url = component.documentUrl({ fileUrl: '/files/a.pdf' } as any);

      expect(url).toContain('/files/a.pdf');
    });
  });

  describe('sections$ (query params logic)', () => {
    // selectSectionsByCategoryId/selectSectionsByUserId are parameterized
    // (factory) selectors, so a plain MockStore.overrideSelector can't match
    // them reliably. Instead we spy on store.select and inspect which
    // selector the component actually asked for, falling back to the real
    // implementation for every other (non-parameterized) selector.
    let selectSpy: jest.SpyInstance;

    const spyOnSelectAndRoute = () => {
      const originalSelect = store.select.bind(store);
      selectSpy = jest.spyOn(store, 'select').mockImplementation((selector: any, ...rest) => {
        return originalSelect(selector, ...rest);
      });
    };

    it('should call selectAllSections when there is no catId and no mine param', () => {
      spyOnSelectAndRoute();
      queryParamMapSubject.next(convertToParamMap({}));

      fixture.detectChanges();

      const calledWithAllSections = selectSpy.mock.calls.some(
        (call) => call[0] === selectAllSections,
      );
      expect(calledWithAllSections).toBe(true);
    });

    it('should request sections by category when catId is present in query params', () => {
      spyOnSelectAndRoute();
      queryParamMapSubject.next(convertToParamMap({ catId: '7' }));

      fixture.detectChanges();

      // selectSectionsByCategoryId is a factory: calling it again with the
      // same id lets us assert the component invoked it with 7.
      const expectedSelector = selectSectionsByCategoryId(7);
      const calledWithCategorySelector = selectSpy.mock.calls.some(
        (call) => JSON.stringify(call[0]) === JSON.stringify(expectedSelector),
      );
      expect(calledWithCategorySelector).toBe(true);
    });

    it('should request sections by current user when mine=true is present in query params', () => {
      const currentUser = makeUser({ id: 42 });
      store.overrideSelector(selectCurrentUser, currentUser);
      store.refreshState();

      spyOnSelectAndRoute();
      queryParamMapSubject.next(convertToParamMap({ mine: 'true' }));

      fixture.detectChanges();

      const expectedSelector = selectSectionsByUserId(42);
      const calledWithUserSelector = selectSpy.mock.calls.some(
        (call) => JSON.stringify(call[0]) === JSON.stringify(expectedSelector),
      );
      expect(calledWithUserSelector).toBe(true);
    });

    it('should fall back to selectAllSections when mine=true but there is no current user', () => {
      store.overrideSelector(selectCurrentUser, null);
      store.refreshState();

      spyOnSelectAndRoute();
      queryParamMapSubject.next(convertToParamMap({ mine: 'true' }));

      fixture.detectChanges();

      const calledWithAllSections = selectSpy.mock.calls.some(
        (call) => call[0] === selectAllSections,
      );
      expect(calledWithAllSections).toBe(true);
    });
  });

  describe('template', () => {
    it('should show the loading text when loading$ emits true', () => {
      store.overrideSelector(selectSectionLoading, true);
      store.refreshState();

      fixture.detectChanges();

      const loadingEl = fixture.debugElement.query(By.css('.loading-text'));
      expect(loadingEl).toBeTruthy();
      expect(loadingEl.nativeElement.textContent).toContain('Loading sections...');
    });

    it('should NOT show the loading text when loading$ emits false', () => {
      store.overrideSelector(selectSectionLoading, false);
      store.refreshState();

      fixture.detectChanges();

      const loadingEl = fixture.debugElement.query(By.css('.loading-text'));
      expect(loadingEl).toBeFalsy();
    });

    it('should show the error text when error$ has a value', () => {
      store.overrideSelector(selectSectionError, 'Something went wrong');
      store.refreshState();

      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(By.css('.error-text'));
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.textContent).toContain('Something went wrong');
    });

    it('should show the empty state message when there are no sections', () => {
      store.overrideSelector(selectAllSections, []);
      store.refreshState();

      fixture.detectChanges();

      const emptyEl = fixture.debugElement.query(By.css('.empty-text'));
      expect(emptyEl).toBeTruthy();
      expect(emptyEl.nativeElement.textContent).toContain('No sections found.');
    });

    it('should render the modify actions (star/edit/delete) when the section is modifiable', () => {
      const currentUser = makeUser({ id: 1 });
      const sections = [makeSection({ id: 1, visibility: true, createdBy: { id: 1 } as any })];

      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(
        By.css('.section-top-actions button'),
      );
      expect(actionButtons.length).toBe(3);
    });

    it('should NOT render the modify actions when the section is not modifiable', () => {
      const currentUser = makeUser({ id: 1 });
      const sections = [
        makeSection({ id: 1, visibility: true, createdBy: { id: 999 } as any }),
      ];

      store.overrideSelector(selectAllSections, sections);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(
        By.css('.section-top-actions button'),
      );
      expect(actionButtons.length).toBe(0);
    });

    it('should call toggleImportant() when the star button is clicked', () => {
      const currentUser = makeUser({ id: 1 });
      const section = makeSection({
        id: 1,
        visibility: true,
        important: false,
        createdBy: { id: 1 } as any,
      });

      store.overrideSelector(selectAllSections, [section]);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      const toggleSpy = jest.spyOn(component, 'toggleImportant');
      const starButton = fixture.debugElement.query(
        By.css('button[aria-label="Mark as important"]'),
      );

      expect(starButton).toBeTruthy();
      starButton.nativeElement.click();

      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should call deleteSection() with the correct id when the delete button is clicked', () => {
      const currentUser = makeUser({ id: 1 });
      const section = makeSection({ id: 77, visibility: true, createdBy: { id: 1 } as any });

      store.overrideSelector(selectAllSections, [section]);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      const deleteSpy = jest.spyOn(component, 'deleteSection');
      // Order in the template is: star, edit, delete.
      const actionButtons = fixture.debugElement.queryAll(
        By.css('.section-top-actions button'),
      );
      const deleteButton = actionButtons[actionButtons.length - 1];

      deleteButton.nativeElement.click();

      expect(deleteSpy).toHaveBeenCalledWith(77);
    });

    it('should call startEdit() when the edit button is clicked', () => {
      const currentUser = makeUser({ id: 1 });
      const section = makeSection({ id: 5, visibility: true, createdBy: { id: 1 } as any });

      store.overrideSelector(selectAllSections, [section]);
      store.overrideSelector(selectCurrentUser, currentUser);
      store.overrideSelector(selectUserRole, 'USER');
      store.refreshState();

      fixture.detectChanges();

      const startEditSpy = jest.spyOn(component, 'startEdit');
      // Order in the template is: star, edit, delete.
      const actionButtons = fixture.debugElement.queryAll(
        By.css('.section-top-actions button'),
      );
      const editButton = actionButtons[1];

      editButton.nativeElement.click();

      expect(startEditSpy).toHaveBeenCalled();
    });
  });
});