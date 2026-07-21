import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionListComponent } from './section-list.component';

describe('SectionListComponent', () => {
  let component: SectionListComponent;
  let fixture: ComponentFixture<SectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
