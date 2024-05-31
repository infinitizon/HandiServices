import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { GoogleMapsModule } from '@angular/google-maps'

import { SharedModule } from '@app/_shared/shared.module';
import { ViewHomeComponent } from './view/view-home/view-home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ViewCategoriesComponent } from './view/view-categories/view-categories.component';
import { ViewSubCategoriesComponent } from './view/view-sub-categories/view-sub-categories.component';
import { ViewProvidersComponent } from './view/view-providers/view-providers.component';
import { RecommendedComponent } from './view/recommended/recommended.component';
import { ViewRecommendedComponent } from './view/view-recommended/view-recommended.component';
import { ViewProviderAttrComponent } from './view/view-provider-attr/provider-attr.component';
import { ViewCheckoutComponent } from './view/view-checkout/view-checkout.component';
import { CartComponent } from './view/cart/cart.component';
import { ViewRecommendedDetailComponent } from './view/view-recommended-detail/view-recommended-detail.component';
import { ViewSearchProductComponent } from './view/view-search-product/view-search-product.component';

@NgModule({
  imports: [
    CommonModule,
    GoogleMapsModule,
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    ViewHomeComponent,
    ViewCategoriesComponent,
    ViewSubCategoriesComponent,
    ViewProvidersComponent,
    ViewRecommendedComponent, RecommendedComponent,
    ViewRecommendedDetailComponent,
    ViewProviderAttrComponent,
    ViewCheckoutComponent,
    CartComponent,
    ViewSearchProductComponent
  ]
})
export class HomeModule { }
