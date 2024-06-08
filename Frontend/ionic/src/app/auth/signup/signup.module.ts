import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { IonicModule } from '@ionic/angular';
import { IonIntlTelInputModule } from '@jongbonga/ion-intl-tel-input';

import { SignupPageRoutingModule } from './signup-routing.module';

import { SignupPage } from './signup.page';
import { SharedModule } from '@app/_shared/shared.module';
import { StartComponent } from './start/start.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SignupPageRoutingModule,

    MatStepperModule,
    IonIntlTelInputModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [
    SignupPage,
    StartComponent,
  ]
})
export class SignupPageModule {}
