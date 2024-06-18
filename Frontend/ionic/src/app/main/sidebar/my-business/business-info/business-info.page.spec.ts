import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessInfoPage } from './business-info.page';

describe('BusinessInfoPage', () => {
  let component: BusinessInfoPage;
  let fixture: ComponentFixture<BusinessInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
