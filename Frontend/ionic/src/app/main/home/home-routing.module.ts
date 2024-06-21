import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'category/:categoryId',
    loadChildren: () => import('./sub-categories/sub-categories.module').then( m => m.SubCategoriesPageModule)
  },
  {
    path: 'product-providers/:productId',
    loadChildren: () => import('./product-providers/product-providers.module').then( m => m.ProductProvidersPageModule)
  },
  {
    path: 'product-checkout/:providerId/:subCategoryId/characteristics',
    loadChildren: () => import('./product-checkout/product-checkout.module').then( m => m.ProductCheckoutPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module').then( m => m.CartPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
