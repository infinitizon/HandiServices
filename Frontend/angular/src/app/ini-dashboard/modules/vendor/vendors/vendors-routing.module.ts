import { Routes, RouterModule } from '@angular/router';
import { VendorsComponent } from './vendors.component';
import { VendorsListComponent } from './view/vendors-list/vendors-list.component';
import { NgModule } from '@angular/core';
import { DetailsContainerComponent } from './details/details-container/details-container.component';

const routes: Routes = [
  {
    path: '',
    component: VendorsComponent,
    children: [
      {
        path: 'view',
        component: VendorsListComponent
      },
      {
        path: 'details',
        component: DetailsContainerComponent
      },
      {
        path: 'details/:id',
        component: DetailsContainerComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/vendors/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class VendorsRoutingModule {}
