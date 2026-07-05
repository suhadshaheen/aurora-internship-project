import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserPasswordCard } from './reser-password-card';

describe('ReserPasswordCard', () => {
  let component: ReserPasswordCard;
  let fixture: ComponentFixture<ReserPasswordCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserPasswordCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReserPasswordCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
