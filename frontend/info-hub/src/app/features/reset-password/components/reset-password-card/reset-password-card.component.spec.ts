import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordCard } from './reset-password-card.component';

describe('ResetPasswordCard', () => {
  let component: ResetPasswordCard;
  let fixture: ComponentFixture<ResetPasswordCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
