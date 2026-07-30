import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSectionComponent } from './add-section.component';

describe('AddSectionComponent', () => {
  let component: AddSectionComponent;
  let fixture: ComponentFixture<AddSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
