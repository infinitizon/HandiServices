import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatStepperModule } from '@angular/material/stepper';

import { LoginPageRoutingModule } from './login-routing.module';
import { SharedModule } from '@app/_shared/shared.module';

import { LoginPage } from './login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    MatStepperModule,
    SharedModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
