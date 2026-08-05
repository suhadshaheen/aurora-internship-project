import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import DOMPurify from 'dompurify';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';

import { CommentComponent } from '../comment/comment.component';
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
import { ISectionDocResponse } from '../../../../../models/SectionDocResponse.interface';
import { AuthUser } from '../../../login-page/store/auth.state';
import { environment } from '../../../../../environments/environment';
import { quillLinkHandler } from '../../../../shared/utils/quill-link-handler';

interface DisplaySection extends ISection {
  isOwn: boolean;
  canModify: boolean;
  safeContent: SafeHtml;
}

@Component({
  selector: 'app-section-list',
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    EditorModule,
    DialogModule,
    CommentComponent,
  ],
  templateUrl: './section-list.component.html',
  styleUrl: './section-list.component.css',
})
export class SectionListComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  currentUser$ = this.store.select(selectCurrentUser);
  role$ = this.store.select(selectUserRole);

  sections$ = combineLatest([this.route.queryParamMap, this.currentUser$]).pipe(
    switchMap(([params, user]) => {
      const catId = Number(params.get('catId'));
      const mine = params.get('mine') === 'true';

      if (catId) {
        return this.store.select(selectSectionsByCategoryId(catId));
      }
      if (mine && user) {
        return this.store.select(selectSectionsByUserId(user.id));
      }
      return this.store.select(selectAllSections);
    }),
  );

  visibleSections$ = combineLatest([this.sections$, this.role$, this.currentUser$]).pipe(
    map(([sections, role, user]) => this.buildDisplaySections(sections, role, user)),
  );

  sectionCount$ = this.visibleSections$.pipe(map((sections) => sections.length));

  loading$ = this.store.select(selectSectionLoading);
  error$ = this.store.select(selectSectionError);

  editingSection: DisplaySection | null = null;
  editDialogVisible = false;
  editTitle = '';
  editContent = '';
  editDocuments: File[] = [];

  lightboxUrl: string | null = null;

  ngOnInit(): void {
    this.store.dispatch(SectionActions.loadSections());
  }

  onContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      this.lightboxUrl = (target as HTMLImageElement).src;
    }
  }

  closeLightbox(): void {
    this.lightboxUrl = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }

  onEditorInit(event: { editor: any }): void {
    event.editor.getModule('toolbar').addHandler('link', quillLinkHandler);
  }

  startEdit(section: DisplaySection): void {
    this.editingSection = section;
    this.editTitle = section.title;
    this.editContent = section.content;
    this.editDocuments = [];
    this.editDialogVisible = true;
  }

  cancelEdit(): void {
    this.editingSection = null;
    this.editTitle = '';
    this.editContent = '';
    this.editDocuments = [];
    this.editDialogVisible = false;
  }

  onEditDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      this.cancelEdit();
    }
  }

  onEditDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editDocuments.push(...Array.from(input.files ?? []));
    input.value = '';
  }

  removeEditDocument(index: number): void {
    this.editDocuments.splice(index, 1);
  }

  removeExistingDocument(documentId: number): void {
    const section = this.editingSection;
    if (!section) {
      return;
    }

    this.store.dispatch(SectionActions.deleteSectionDocument({ sectionId: section.id, documentId }));

    // Optimistic local update so the dialog reflects the removal immediately
    // instead of waiting on the round trip.
    this.editingSection = {
      ...section,
      documents: section.documents.filter((d) => d.id !== documentId),
    };
  }

  submitEdit(): void {
    const section = this.editingSection;
    const title = this.editTitle.trim();
    const content = this.editContent.trim();
    if (!section || !title || !content) {
      return;
    }

    this.store.dispatch(
      SectionActions.updateSection({
        id: section.id,
        title,
        content,
        categoryId: section.category.id,
        visibility: section.visibility,
        documents: this.editDocuments,
      }),
    );

    this.editingSection = null;
    this.editTitle = '';
    this.editContent = '';
    this.editDocuments = [];
    this.editDialogVisible = false;
  }

  deleteSection(id: number): void {
    this.store.dispatch(SectionActions.deleteSection({ sectionId: id }));
  }

  toggleImportant(section: DisplaySection): void {
    this.store.dispatch(
      SectionActions.setSectionImportant({ id: section.id, important: !section.important }),
    );
  }

  documentUrl(document: ISectionDocResponse): string {
    return `${environment.apiUrl}${document.fileUrl}`;
  }

  private buildDisplaySections(
    sections: ISection[],
    role: string | null | undefined,
    user: AuthUser | null,
  ): DisplaySection[] {
    const normalizedRole = role?.toLowerCase();
    const isAdmin = normalizedRole === 'admin';
    const canSeeHidden = isAdmin || normalizedRole === 'employee';

    return sections
      .filter((section) => section.visibility === true || canSeeHidden)
      .map((section) => {
        const isOwn = !!user && user.id === section.createdBy.id;
        return {
          ...section,
          isOwn,
          canModify: isOwn || isAdmin,
          safeContent: this.sanitizeContent(section.content),
        };
      });
  }

  // Quill's rich-text output relies on inline `style` (color, font-family, etc.)
  // for formatting that Angular's [innerHTML] sanitizer strips wholesale. DOMPurify
  // keeps that formatting while still stripping genuinely dangerous markup
  // (event handler attributes, javascript: URLs, etc.) before we tell Angular to
  // trust the result.
  private sanitizeContent(content: string): SafeHtml {
    const clean = DOMPurify.sanitize(content, { ADD_ATTR: ['target'] });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
