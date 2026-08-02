import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SectionActions } from '../section/store/section.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-add-section',
  imports: [FormsModule, EditorModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './add-section.component.html',
  styleUrl: './add-section.component.css',
})
export class AddSectionComponent {
  private store = inject(Store);

  visible: boolean = false;

  title: string = '';
  content: string = '';
  catId: number | null = null;
  sectionVisibility: boolean = true;

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(): void {
    this.visible = false;
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
      }),
    );

    this.title = '';
    this.content = '';
    this.catId = null;
    this.sectionVisibility = true;
    this.visible = false;
  }
}
