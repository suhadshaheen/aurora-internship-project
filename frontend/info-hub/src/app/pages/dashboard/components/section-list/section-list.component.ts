import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { TagModule } from 'primeng/tag';

import { SectionActions } from '../section/store/section.actions';
import {
  selectAllSections,
  selectSectionLoading,
  selectSectionError
} from '../section/store/section.selectors';

@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    TagModule
  ],
  templateUrl: './section-list.component.html',
  styleUrl: './section-list.component.css'
})
export class SectionListComponent implements OnInit {
  private store = inject(Store);

  sections$ = this.store.select(selectAllSections);

  sectionCount$ = this.sections$.pipe(
    map((sections) => sections.length)
  );

  loading$ = this.store.select(selectSectionLoading);
  error$ = this.store.select(selectSectionError);

  ngOnInit(): void {
    this.store.dispatch(SectionActions.loadSections());
  }
}