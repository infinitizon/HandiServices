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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
