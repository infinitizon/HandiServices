import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductCheckoutPageRoutingModule } from './product-checkout-routing.module';

import { ProductCheckoutPage } from './product-checkout.page';
import { SharedModule } from '@app/_shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductCheckoutPageRoutingModule,
    SharedModule
  ],
  declarations: [ProductCheckoutPage]
})
export class ProductCheckoutPageModule {}
