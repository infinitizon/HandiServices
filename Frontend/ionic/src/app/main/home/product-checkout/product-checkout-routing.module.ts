import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductCheckoutPage } from './product-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: ProductCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductCheckoutPageRoutingModule {}
