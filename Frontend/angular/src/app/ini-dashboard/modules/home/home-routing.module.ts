import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { ViewHomeComponent } from './view/view-home/view-home.component';
import { ViewCategoriesComponent } from './view/view-categories/view-categories.component';
import { ViewSubCategoriesComponent } from './view/view-sub-categories/view-sub-categories.component';
import { ViewProvidersComponent } from './view/view-providers/view-providers.component';
import { ViewCheckoutComponent } from './view/view-checkout/view-checkout.component';
import { CartComponent } from './view/cart/cart.component';
import { ViewRecommendedComponent } from './view/view-recommended/view-recommended.component';
import { ViewSearchProductComponent } from './view/view-search-product/view-search-product.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'view',
        component: ViewHomeComponent
      },
      {
        path: 'view-categories',
        component: ViewCategoriesComponent
      },
      {
        path: 'recommended',
        component: ViewRecommendedComponent
      },
      {
        path: 'view-sub-categories/:id',
        component: ViewSubCategoriesComponent
      },
      {
        path: 'view-providers/:id',
        component: ViewProvidersComponent
      },
      {
        path: 'view-checkout/:id/:subCategoryId/characteristics',
        component: ViewCheckoutComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'search/:id',
        component: ViewSearchProductComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/home/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
