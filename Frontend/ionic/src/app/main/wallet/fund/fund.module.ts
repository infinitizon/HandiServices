import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FundPageRoutingModule } from './fund-routing.module';

import { FundPage } from './fund.page';
import { SharedModule } from '@app/_shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FundPageRoutingModule,
    SharedModule
  ],
  declarations: [FundPage]
})
export class FundPageModule {}
