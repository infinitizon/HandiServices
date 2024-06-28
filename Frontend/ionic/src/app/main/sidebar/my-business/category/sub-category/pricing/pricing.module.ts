import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from '@app/_shared/shared.module';
import { PricingPageRoutingModule } from './pricing-routing.module';

import { PricingPage } from './pricing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PricingPageRoutingModule,
    SharedModule
  ],
  declarations: [PricingPage]
})
export class PricingPageModule {}
