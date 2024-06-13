import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FundPageRoutingModule } from './fund-routing.module';

import { FundPage } from './fund.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FundPageRoutingModule
  ],
  declarations: [FundPage]
})
export class FundPageModule {}
