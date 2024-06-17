import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from '@app/_shared/shared.module';
import { SecurityPageRoutingModule } from './security-routing.module';

import { SecurityPage } from './security.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityPageRoutingModule,
    SharedModule,
  ],
  declarations: [SecurityPage]
})
export class SecurityPageModule {}
