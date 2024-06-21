import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCheckoutPage } from './product-checkout.page';

describe('ProductCheckoutPage', () => {
  let component: ProductCheckoutPage;
  let fixture: ComponentFixture<ProductCheckoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
