import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordCard } from './forgot-password-card.component';

describe('ForgotPasswordCard', () => {
  let component: ForgotPasswordCard;
  let fixture: ComponentFixture<ForgotPasswordCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
