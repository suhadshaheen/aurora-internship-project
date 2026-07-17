import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';

import { CommentComponent } from '../comment/comment.component';
import { SectionActions } from '../section/store/section.actions';
import {
  selectAllSections,
  selectSectionLoading,
  selectSectionError,
  selectSectionsByCategoryId,
  selectSectionsByUserId,
} from '../section/store/section.selectors';
import { selectCurrentUser, selectUserRole } from '../../../login-page.component/store/auth.selectors';
import { ISection } from '../../../../../models/section.interface';
import { AuthUser } from '../../../login-page.component/store/auth.state';

interface DisplaySection extends ISection {
  isOwn: boolean;
  canModify: boolean;
}

@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    EditorModule,
    CommentComponent,
  ],
  templateUrl: './section-list.component.html',
  styleUrl: './section-list.component.css',
})
export class SectionListComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

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

  editingSectionId: number | null = null;
  editTitle = '';
  editContent = '';

  ngOnInit(): void {
    this.store.dispatch(SectionActions.loadSections());
  }

  startEdit(section: DisplaySection): void {
    this.editingSectionId = section.sectionId;
    this.editTitle = section.title;
    this.editContent = section.content;
  }

  cancelEdit(): void {
    this.editingSectionId = null;
    this.editTitle = '';
    this.editContent = '';
  }

  submitEdit(section: DisplaySection): void {
    const title = this.editTitle.trim();
    const content = this.editContent.trim();
    if (!title || !content) {
      return;
    }

    this.store.dispatch(
      SectionActions.updateSection({
        section: {
          ...section,
          title,
          content,
        },
      }),
    );

    this.editingSectionId = null;
    this.editTitle = '';
    this.editContent = '';
  }

deleteSection(id: number): void {
  this.store.dispatch(
    SectionActions.deleteSection({ sectionId: id })
  );
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
        const isOwn = !!user && user.id === section.userId;
        return {
          ...section,
          isOwn,
          canModify: isOwn || isAdmin,
        };
      });
  }
}