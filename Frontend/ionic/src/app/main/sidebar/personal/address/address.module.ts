import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressPageRoutingModule } from './address-routing.module';

import { SharedModule } from '@app/_shared/shared.module';
import { AddressPage } from './address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddressPageRoutingModule,
    SharedModule
  ],
  declarations: [
    AddressPage,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AddressPageModule {}
