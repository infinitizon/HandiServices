import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessInfoComponent } from './business-info.component';
import { ViewBusinessInfoComponent } from './view/view-business-info/view-business-info.component';
import { ViewBusinessInfoContainerComponent } from './view/view-business-info/view-business-info-container.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessInfoComponent,
    children: [
      {
        path: 'view',
        component: ViewBusinessInfoContainerComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/business-info/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class BusinessInfoRoutingModule {}
