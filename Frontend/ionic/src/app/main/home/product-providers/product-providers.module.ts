import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductProvidersPageRoutingModule } from './product-providers-routing.module';

import { ProductProvidersPage } from './product-providers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductProvidersPageRoutingModule
  ],
  declarations: [ProductProvidersPage]
})
export class ProductProvidersPageModule {}
