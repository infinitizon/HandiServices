import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from './faq.component';
import { SharedModule } from '@app/_shared/shared.module';
import { ViewFaqComponent } from './view/view-faq/view-faq.component';
import { FaqRoutingModule } from './faq-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FaqRoutingModule
  ],
  declarations: [
    FaqComponent,
    ViewFaqComponent
  ]
})
export class FaqModule { }
