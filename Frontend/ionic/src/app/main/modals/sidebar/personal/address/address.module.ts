import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressPageRoutingModule } from './address-routing.module';

import { SharedModule } from '@app/_shared/shared.module';
import { AddressPage } from './address.page';
import { AddAddressComponent } from './add-address/add-address.component';
import { IonIntlTelInputModule } from '@jongbonga/ion-intl-tel-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddressPageRoutingModule,
    IonIntlTelInputModule,
    SharedModule
  ],
  declarations: [
    AddressPage,
    AddAddressComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AddressPageModule {}
