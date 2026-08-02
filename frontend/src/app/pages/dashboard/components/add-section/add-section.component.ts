import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SectionActions } from '../section/store/section.actions';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../login-page/store/auth.selectors';
import { take } from 'rxjs';

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

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(): void {
    this.visible = false;
  }

 addSection(): void {
  if (!this.title.trim() || !this.content.trim()) {
    return;
  }

  this.store.select(selectCurrentUser).pipe(take(1)).subscribe((user) => {
    if (!user) {
      return;
    }

    const id = Math.floor(Math.random() * 1_000_000_000);


    this.store.dispatch(
      SectionActions.addSection({
        section: {
          id,
          title: this.title.trim(),
          content: this.content,
          createdBy: user,
          category: { id: this.catId ?? 0 },
          visibility: true,
            dateCreated: new Date(),
        },
      }),
    );

    this.title = '';
    this.content = '';
    this.catId = null;
    this.visible = false;
  });
}
}