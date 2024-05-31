import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderComponent } from './provider.component';
import { SharedModule } from '@app/_shared/shared.module';
import { CategoryListComponent } from './view/category-list/category-list.component';
import { VendorSubCategoriesListComponent } from './view/vendor-sub-categories-list/vendor-sub-categories-list.component';
import { ProviderRoutingModule } from './provider-routing.module';
import { AddVendorCategoryComponent } from './dialog/add-category/add-vendor-category.component';
import { AddXterPriceComponent } from './dialog/add-xter-price/add-xter-price.component';
import { VendorXterPriceListComponent } from './view/vendor-xter-price-list/vendor-xter-price-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProviderRoutingModule
  ],
  declarations: [
    ProviderComponent,
    CategoryListComponent,
    VendorSubCategoriesListComponent,
    VendorXterPriceListComponent,
    AddVendorCategoryComponent,
    AddXterPriceComponent,
  ]
})
export class ProviderModule { }
