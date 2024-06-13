import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FundPage } from './fund.page';

describe('FundPage', () => {
  let component: FundPage;
  let fixture: ComponentFixture<FundPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FundPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
