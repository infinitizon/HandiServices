import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductProvidersPage } from './product-providers.page';

describe('ProductProvidersPage', () => {
  let component: ProductProvidersPage;
  let fixture: ComponentFixture<ProductProvidersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductProvidersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
