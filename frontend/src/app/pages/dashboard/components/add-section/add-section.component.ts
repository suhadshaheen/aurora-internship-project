import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SectionActions } from '../section/store/section.actions';
import { CategoryActions } from '../category/store/category.actions';
import { selectCategories } from '../category/store/category.selectors';
import { Store } from '@ngrx/store';
import { quillLinkHandler } from '../../../../shared/utils/quill-link-handler';

@Component({
  selector: 'app-add-section',
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './add-section.component.html',
  styleUrl: './add-section.component.css',
})
export class AddSectionComponent implements OnInit {
  private store = inject(Store);

  categories$ = this.store.select(selectCategories);

  visible: boolean = false;

  title: string = '';
  content: string = '';
  catId: number | null = null;
  sectionVisibility: boolean = true;
  documents: File[] = [];

  ngOnInit(): void {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(): void {
    this.visible = false;
    this.resetFiles();
  }

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.documents.push(...Array.from(input.files ?? []));
    input.value = '';
  }

  removeDocument(index: number): void {
    this.documents.splice(index, 1);
  }

  private resetFiles(): void {
    this.documents = [];
  }

  onEditorInit(event: { editor: any }): void {
    event.editor.getModule('toolbar').addHandler('link', quillLinkHandler);
  }

  addSection(): void {
    if (!this.title.trim() || !this.content.trim() || !this.catId) {
      return;
    }

    this.store.dispatch(
      SectionActions.addSection({
        title: this.title.trim(),
        content: this.content,
        categoryId: this.catId!,
        visibility: this.sectionVisibility,
        documents: this.documents,
      }),
    );

    this.title = '';
    this.content = '';
    this.catId = null;
    this.sectionVisibility = true;
    this.resetFiles();
    this.visible = false;
  }
}
