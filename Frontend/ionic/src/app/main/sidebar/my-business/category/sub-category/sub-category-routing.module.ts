import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubCategoryPage } from './sub-category.page';

const routes: Routes = [
  {
    path: '',
    component: SubCategoryPage
  },
  {
    path: 'pricing/:categoryId/:serviceId',
    loadChildren: () => import('./pricing/pricing.module').then( m => m.PricingPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubCategoryPageRoutingModule {}
