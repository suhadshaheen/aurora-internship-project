import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AddSectionComponent } from './add-section.component';
import { SectionActions } from '../section/store/section.actions';
import { CategoryActions } from '../category/store/category.actions';
import { selectCategories } from '../category/store/category.selectors';

describe('AddSectionComponent', () => {
  let component: AddSectionComponent;
  let fixture: ComponentFixture<AddSectionComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSectionComponent, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: {} })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCategories, []);

    fixture = TestBed.createComponent(AddSectionComponent);
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
    it('should dispatch CategoryActions.loadCategories()', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(CategoryActions.loadCategories());
    });
  });

  describe('showDialog() / closeDialog()', () => {
    beforeEach(() => fixture.detectChanges());

    it('showDialog() should set visible=true', () => {
      component.showDialog();
      expect(component.visible).toBe(true);
    });

    it('closeDialog() should set visible=false and clear documents', () => {
      component.visible = true;
      component.documents = [new File([], 'a.txt')];

      component.closeDialog();

      expect(component.visible).toBe(false);
      expect(component.documents).toEqual([]);
    });
  });

  describe('document management', () => {
    beforeEach(() => fixture.detectChanges());

    it('onDocumentsSelected() should append selected files and reset the input value', () => {
      const file = new File(['content'], 'doc.pdf');
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      input.value = 'C:\\fakepath\\doc.pdf';

      const event = { target: input } as unknown as Event;
      component.onDocumentsSelected(event);

      expect(component.documents).toEqual([file]);
      expect(input.value).toBe('');
    });

    it('onDocumentsSelected() should append to existing documents rather than replace them', () => {
      const fileA = new File([], 'a.txt');
      const fileB = new File([], 'b.txt');
      component.documents = [fileA];

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [fileB] });
      component.onDocumentsSelected({ target: input } as unknown as Event);

      expect(component.documents).toEqual([fileA, fileB]);
    });

    it('removeDocument() should remove the file at the given index', () => {
      const fileA = new File([], 'a.txt');
      const fileB = new File([], 'b.txt');
      component.documents = [fileA, fileB];

      component.removeDocument(0);

      expect(component.documents).toEqual([fileB]);
    });
  });

  describe('addSection()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should NOT dispatch if title is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.title = '   ';
      component.content = 'Some content';
      component.catId = 1;

      component.addSection();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should NOT dispatch if content is empty after trim', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.title = 'Title';
      component.content = '   ';
      component.catId = 1;

      component.addSection();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should NOT dispatch if no category is selected', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.title = 'Title';
      component.content = 'Some content';
      component.catId = null;

      component.addSection();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch SectionActions.addSection with trimmed title and current form state', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const docs = [new File([], 'a.pdf')];

      component.title = '  New Section  ';
      component.content = 'Section content';
      component.catId = 3;
      component.sectionVisibility = false;
      component.documents = docs;

      component.addSection();

      expect(dispatchSpy).toHaveBeenCalledWith(
        SectionActions.addSection({
          title: 'New Section',
          content: 'Section content',
          categoryId: 3,
          visibility: false,
          documents: docs,
        }),
      );
    });

    it('should reset the form state and close the dialog after a successful dispatch', () => {
      component.title = 'New Section';
      component.content = 'Section content';
      component.catId = 3;
      component.sectionVisibility = false;
      component.documents = [new File([], 'a.pdf')];
      component.visible = true;

      component.addSection();

      expect(component.title).toBe('');
      expect(component.content).toBe('');
      expect(component.catId).toBeNull();
      expect(component.sectionVisibility).toBe(true);
      expect(component.documents).toEqual([]);
      expect(component.visible).toBe(false);
    });
  });

  describe('template', () => {
    it('should open the dialog when the "Add Section" trigger button is clicked', () => {
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(By.css('button.add-section-trigger'));
      expect(trigger).toBeTruthy();

      trigger.nativeElement.click();
      fixture.detectChanges();

      expect(component.visible).toBe(true);
    });

    it('should call closeDialog() when the Cancel button is clicked', () => {
      fixture.detectChanges();
      component.visible = true;
      component.documents = [new File([], 'a.txt')];
      fixture.detectChanges();

      const closeDialogSpy = jest.spyOn(component, 'closeDialog');
      const cancelBtn = fixture.debugElement.query(By.css('.cancel-btn'));

      expect(cancelBtn).toBeTruthy();
      cancelBtn.nativeElement.click();

      expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('should call addSection() when the Add (save) button is clicked', () => {
      fixture.detectChanges();
      component.visible = true;
      fixture.detectChanges();

      const addSectionSpy = jest.spyOn(component, 'addSection');
      const saveBtn = fixture.debugElement.query(By.css('.save-btn'));

      expect(saveBtn).toBeTruthy();
      saveBtn.nativeElement.click();

      expect(addSectionSpy).toHaveBeenCalled();
    });
  });
});