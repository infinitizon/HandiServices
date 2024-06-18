import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityQuestionPageRoutingModule } from './security-question-routing.module';

import { SecurityQuestionPage } from './security-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityQuestionPageRoutingModule
  ],
  declarations: [SecurityQuestionPage]
})
export class SecurityQuestionPageModule {}
