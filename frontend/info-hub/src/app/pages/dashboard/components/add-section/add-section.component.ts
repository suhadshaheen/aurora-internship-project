import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SectionActions } from '../section/store/section.actions';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../login-page.component/store/auth.selectors';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [FormsModule, EditorModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './add-section.component.html',
  styleUrl: './add-section.component.css',
})
export class AddSectionComponent {
  private store = inject(Store);

  visible: boolean = false;

  title: string = '';
  content: string = '';
  catId: string = '';

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

    const id = crypto.randomUUID();

    this.store.dispatch(
      SectionActions.addSection({
        section: {
          id,
          sectionId: id,
          title: this.title.trim(),
          content: this.content,
          userId: String(user.id),
          catId: this.catId.trim() || 'general',
          visibility: true,
            dateCreated: new Date(),
        },
      }),
    );

    this.title = '';
    this.content = '';
    this.catId = '';
    this.visible = false;
  });
}
}