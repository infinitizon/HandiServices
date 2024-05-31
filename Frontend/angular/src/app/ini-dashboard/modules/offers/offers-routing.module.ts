import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OffersComponent } from './offers.component';
import { MyPortfolioDistributionComponent } from './view/my-portfolio-distribution/my-portfolio-distribution.component';
import { OffersDetailComponent } from './details/offers-detail/offers-detail.component';
import { GatewayPaymentComponent } from './view/gateway-payment/gateway-payment.component';

const routes: Routes = [
  {
    path: '',
    component: OffersComponent,
    children: [
         {
          path: 'my-portfolio-distribution/:id',
          component: MyPortfolioDistributionComponent
         },
         {
          path: 'offers-detail/:id',
          component: OffersDetailComponent
         },
         {
          path: 'gateway-payment',
          component: GatewayPaymentComponent
         }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffersRoutingModule { }
