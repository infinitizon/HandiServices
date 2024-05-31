import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from './feedback.component';
import { SharedModule } from '@app/_shared/shared.module';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { CreateFeedbackComponent } from './create/create-feedback/create-feedback.component';
import { ViewFeedbackComponent } from './view/view-feedback/view-feedback.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FeedbackRoutingModule
  ],
  declarations: [
    FeedbackComponent,
    CreateFeedbackComponent,
    ViewFeedbackComponent,
  ]
})
export class FeedbackModule { }
