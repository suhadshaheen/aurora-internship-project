import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { TagModule } from 'primeng/tag';

import { SectionActions } from '../section/store/section.actions';
import {
  selectAllSections,
  selectSectionLoading,
  selectSectionError,
  selectSectionsByCategoryId,
} from '../section/store/section.selectors';
import { selectCurrentUser } from '../../../login-page.component/store/auth.selectors';
import { selectSectionsByUserId } from '../section/store/section.selectors';
import { selectUserRole } from '../../../login-page.component/store/auth.selectors';

@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [AsyncPipe, DatePipe, TagModule],
  templateUrl: './section-list.component.html',
  styleUrl: './section-list.component.css',
})
export class SectionListComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  sections$ = combineLatest([this.route.queryParamMap, this.store.select(selectCurrentUser)]).pipe(
    switchMap(([params, user]) => {
      const catId = params.get('catId');
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

  role$ = this.store.select(selectUserRole);

  visibleSections$ = combineLatest([this.sections$, this.role$]).pipe(
    map(([sections, role]) => {
      const normalizedRole = role?.toLowerCase();

      const canSeeHidden = normalizedRole === 'admin' || normalizedRole === 'employee';

      return sections.filter((section) => {
        return section.visibility === true || canSeeHidden;
      });
    }),
  );

  sectionCount$ = this.visibleSections$.pipe(map((sections) => sections.length));

  loading$ = this.store.select(selectSectionLoading);
  error$ = this.store.select(selectSectionError);

  ngOnInit(): void {
    this.store.dispatch(SectionActions.loadSections());
  }
}
