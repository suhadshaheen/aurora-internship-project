import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { SectionEffects } from './section.effects';
import { SectionActions } from './section.actions';
import { SectionsService } from '../services/sections.service';
import { ISection } from '../../../../../../models/section.interface';

describe('SectionEffects', () => {
  let effects: SectionEffects;
  let actions$: Observable<any>;
  let sectionsServiceMock: {
    getAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteDocument: jest.Mock;
    setImportant: jest.Mock;
  };

  const makeSection = (overrides: Partial<ISection> = {}): ISection =>
    ({
      id: 1,
      title: 'Title',
      content: 'Content',
      visibility: true,
      important: false,
      createdAt: new Date().toISOString(),
      createdBy: { id: 1 },
      category: { id: 1, catName: 'General' },
      documents: [],
      ...overrides,
    }) as unknown as ISection;

  beforeEach(() => {
    sectionsServiceMock = {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteDocument: jest.fn(),
      setImportant: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SectionEffects,
        provideMockActions(() => actions$),
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
    });

    effects = TestBed.inject(SectionEffects);
  });

  describe('loadSections$', () => {
    it('should dispatch loadSectionsSuccess with the sections on success', async () => {
      const sections = [makeSection({ id: 1 }), makeSection({ id: 2 })];
      sectionsServiceMock.getAll.mockReturnValue(of(sections));
      actions$ = of(SectionActions.loadSections());

      const result = await firstValueFrom(effects.loadSections$);

      expect(sectionsServiceMock.getAll).toHaveBeenCalled();
      expect(result).toEqual(SectionActions.loadSectionsSuccess({ sections }));
    });

    it('should dispatch loadSectionsFailure with the error message on failure', async () => {
      sectionsServiceMock.getAll.mockReturnValue(
        throwError(() => new Error('Network error')),
      );
      actions$ = of(SectionActions.loadSections());

      const result = await firstValueFrom(effects.loadSections$);

      expect(result).toEqual(
        SectionActions.loadSectionsFailure({ error: 'Network error' }),
      );
    });
  });

  describe('addSection$', () => {
    it('should build FormData correctly and dispatch addSectionSuccess on success', async () => {
      const createdSection = makeSection({ id: 5, title: 'New Section' });
      sectionsServiceMock.create.mockReturnValue(of(createdSection));

      actions$ = of(
        SectionActions.addSection({
          title: 'New Section',
          content: 'Some content',
          categoryId: 3,
          visibility: true,
        }),
      );

      const result = await firstValueFrom(effects.addSection$);

      expect(sectionsServiceMock.create).toHaveBeenCalledTimes(1);
      const formData = sectionsServiceMock.create.mock.calls[0][0] as FormData;
      expect(formData.get('title')).toBe('New Section');
      expect(formData.get('content')).toBe('Some content');
      expect(formData.get('categoryId')).toBe('3');
      expect(formData.get('visibility')).toBe('true');

      expect(result).toEqual(
        SectionActions.addSectionSuccess({ section: createdSection }),
      );
    });

    it('should append images and documents files to FormData when provided', async () => {
      sectionsServiceMock.create.mockReturnValue(of(makeSection()));
      const imageFile = new File(['img'], 'photo.png');
      const docFile = new File(['doc'], 'file.pdf');

      actions$ = of(
        SectionActions.addSection({
          title: 't',
          content: 'c',
          categoryId: 1,
          visibility: false,
          images: [imageFile],
          documents: [docFile],
        }),
      );

      await firstValueFrom(effects.addSection$);

      const formData = sectionsServiceMock.create.mock.calls[0][0] as FormData;
      expect(formData.getAll('images')).toEqual([imageFile]);
      expect(formData.getAll('documents')).toEqual([docFile]);
    });

    it('should dispatch addSectionFailure with the error message on failure', async () => {
      sectionsServiceMock.create.mockReturnValue(
        throwError(() => new Error('Upload failed')),
      );

      actions$ = of(
        SectionActions.addSection({
          title: 't',
          content: 'c',
          categoryId: 1,
          visibility: true,
        }),
      );

      const result = await firstValueFrom(effects.addSection$);

      expect(result).toEqual(
        SectionActions.addSectionFailure({ error: 'Upload failed' }),
      );
    });
  });

  describe('updateSection$', () => {
    it('should build FormData correctly and dispatch updateSectionSuccess on success', async () => {
      const updatedSection = makeSection({ id: 7, title: 'Updated' });
      sectionsServiceMock.update.mockReturnValue(of(updatedSection));

      actions$ = of(
        SectionActions.updateSection({
          id: 7,
          title: 'Updated',
          content: 'New content',
          categoryId: 2,
          visibility: false,
        }),
      );

      const result = await firstValueFrom(effects.updateSection$);

      expect(sectionsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(sectionsServiceMock.update.mock.calls[0][0]).toBe(7);
      const formData = sectionsServiceMock.update.mock.calls[0][1] as FormData;
      expect(formData.get('title')).toBe('Updated');
      expect(formData.get('visibility')).toBe('false');

      expect(result).toEqual(
        SectionActions.updateSectionSuccess({ section: updatedSection }),
      );
    });

    it('should dispatch updateSectionFailure with the error message on failure', async () => {
      sectionsServiceMock.update.mockReturnValue(
        throwError(() => new Error('Update failed')),
      );

      actions$ = of(
        SectionActions.updateSection({
          id: 1,
          title: 't',
          content: 'c',
          categoryId: 1,
          visibility: true,
        }),
      );

      const result = await firstValueFrom(effects.updateSection$);

      expect(result).toEqual(
        SectionActions.updateSectionFailure({ error: 'Update failed' }),
      );
    });
  });

  describe('deleteSection$', () => {
    it('should dispatch deleteSectionSuccess with the sectionId on success', async () => {
      sectionsServiceMock.delete.mockReturnValue(of(undefined));
      actions$ = of(SectionActions.deleteSection({ sectionId: 9 }));

      const result = await firstValueFrom(effects.deleteSection$);

      expect(sectionsServiceMock.delete).toHaveBeenCalledWith(9);
      expect(result).toEqual(
        SectionActions.deleteSectionSuccess({ sectionId: 9 }),
      );
    });

    it('should dispatch deleteSectionFailure with the error message on failure', async () => {
      sectionsServiceMock.delete.mockReturnValue(
        throwError(() => new Error('Delete failed')),
      );
      actions$ = of(SectionActions.deleteSection({ sectionId: 9 }));

      const result = await firstValueFrom(effects.deleteSection$);

      expect(result).toEqual(
        SectionActions.deleteSectionFailure({ error: 'Delete failed' }),
      );
    });
  });

  describe('deleteSectionDocument$', () => {
    it('should dispatch deleteSectionDocumentSuccess with the updated section on success', async () => {
      const updatedSection = makeSection({ id: 3, documents: [] });
      sectionsServiceMock.deleteDocument.mockReturnValue(of(updatedSection));

      actions$ = of(
        SectionActions.deleteSectionDocument({ sectionId: 3, documentId: 15 }),
      );

      const result = await firstValueFrom(effects.deleteSectionDocument$);

      expect(sectionsServiceMock.deleteDocument).toHaveBeenCalledWith(3, 15);
      expect(result).toEqual(
        SectionActions.deleteSectionDocumentSuccess({ section: updatedSection }),
      );
    });

    it('should dispatch deleteSectionDocumentFailure with the error message on failure', async () => {
      sectionsServiceMock.deleteDocument.mockReturnValue(
        throwError(() => new Error('Doc delete failed')),
      );

      actions$ = of(
        SectionActions.deleteSectionDocument({ sectionId: 3, documentId: 15 }),
      );

      const result = await firstValueFrom(effects.deleteSectionDocument$);

      expect(result).toEqual(
        SectionActions.deleteSectionDocumentFailure({ error: 'Doc delete failed' }),
      );
    });
  });

  describe('setSectionImportant$', () => {
    it('should dispatch setSectionImportantSuccess with the updated section on success', async () => {
      const updatedSection = makeSection({ id: 4, important: true });
      sectionsServiceMock.setImportant.mockReturnValue(of(updatedSection));

      actions$ = of(
        SectionActions.setSectionImportant({ id: 4, important: true }),
      );

      const result = await firstValueFrom(effects.setSectionImportant$);

      expect(sectionsServiceMock.setImportant).toHaveBeenCalledWith(4, true);
      expect(result).toEqual(
        SectionActions.setSectionImportantSuccess({ section: updatedSection }),
      );
    });

    it('should dispatch setSectionImportantFailure with the error message on failure', async () => {
      sectionsServiceMock.setImportant.mockReturnValue(
        throwError(() => new Error('Toggle failed')),
      );

      actions$ = of(
        SectionActions.setSectionImportant({ id: 4, important: true }),
      );

      const result = await firstValueFrom(effects.setSectionImportant$);

      expect(result).toEqual(
        SectionActions.setSectionImportantFailure({ error: 'Toggle failed' }),
      );
    });
  });
});