import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewFaqComponent } from './view/view-faq/view-faq.component';
import { FaqComponent } from './faq.component';

const routes: Routes = [
  {
    path: '',
    component: FaqComponent,
    children: [
      {
        path: 'view',
        component: ViewFaqComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/faq/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaqRoutingModule { }
