import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIntlTelInputModule } from '@jongbonga/ion-intl-tel-input';

import { SharedModule } from '@app/_shared/shared.module';
import { IonicModule } from '@ionic/angular';

import { NokPageRoutingModule } from './nok-routing.module';

import { NokPage } from './nok.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NokPageRoutingModule,
    SharedModule,
    IonIntlTelInputModule
  ],
  declarations: [NokPage]
})
export class NokPageModule {}
