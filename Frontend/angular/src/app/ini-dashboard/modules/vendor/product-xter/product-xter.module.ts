import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductXterComponent } from './product-xter.component';
import { SharedModule } from '@app/_shared/shared.module';
import { ProductXterListComponent } from './view/product-xter-list/product-xter-list.component';
import { ProductXterRoutingModule } from './product-xter-routing.module';
import { AddProductXterComponent } from './dialog/add-product-xter/add-product-xter.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProductXterRoutingModule
  ],
  declarations: [
    ProductXterComponent,
    ProductXterListComponent,
    AddProductXterComponent
  ]
})
export class ProductXterModule { }
