import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyBusinessPageRoutingModule } from './my-business-routing.module';

import { MyBusinessPage } from './my-business.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyBusinessPageRoutingModule
  ],
  declarations: [MyBusinessPage]
})
export class MyBusinessPageModule {}
