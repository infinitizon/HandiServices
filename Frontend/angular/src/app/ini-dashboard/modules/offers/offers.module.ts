import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from './offers.component';
import { SharedModule } from '@app/_shared/shared.module';
import { OffersRoutingModule } from './offers-routing.module';
import { MyPortfolioDistributionComponent } from './view/my-portfolio-distribution/my-portfolio-distribution.component';
import { OffersDetailComponent } from './details/offers-detail/offers-detail.component';
import { GatewayPaymentComponent } from './view/gateway-payment/gateway-payment.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OffersRoutingModule
  ],
  declarations: [
    OffersComponent,
    MyPortfolioDistributionComponent,
    OffersDetailComponent,
    GatewayPaymentComponent
  ]
})
export class OffersModule { }
