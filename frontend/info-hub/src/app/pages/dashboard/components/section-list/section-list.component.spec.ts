import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectonListComponent } from './section-list.component';

describe('SectonListComponent', () => {
  let component: SectonListComponent;
  let fixture: ComponentFixture<SectonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectonListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectonListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
