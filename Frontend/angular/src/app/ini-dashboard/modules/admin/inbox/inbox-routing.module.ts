import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewInboxComponent } from './view/view-inbox/view-inbox.component';
import { InboxComponent } from './inbox.component';

const routes: Routes = [
  {
    path: '',
    component: InboxComponent,
    children: [
      {
        path: 'view',
        component: ViewInboxComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/inbox/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class InboxRoutingModule {}
