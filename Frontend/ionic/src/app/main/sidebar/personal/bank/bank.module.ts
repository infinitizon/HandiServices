import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BankPageRoutingModule } from './bank-routing.module';

import { BankPage } from './bank.page';
import { SharedModule } from '@app/_shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BankPageRoutingModule,
    SharedModule,
  ],
  declarations: [BankPage]
})
export class BankPageModule {}
