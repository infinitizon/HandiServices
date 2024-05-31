import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewFeedbackComponent } from './view/view-feedback/view-feedback.component';
import { CreateFeedbackComponent } from './create/create-feedback/create-feedback.component';
import { FeedbackComponent } from './feedback.component';
const routes: Routes = [
  {
    path: '',
    component: FeedbackComponent,
    children: [
      {
        path: 'view',
        component: ViewFeedbackComponent
      },
      {
        path: 'create',
        component: CreateFeedbackComponent
      },
      { path: '', redirectTo: 'create', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/feedback/create', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule { }
