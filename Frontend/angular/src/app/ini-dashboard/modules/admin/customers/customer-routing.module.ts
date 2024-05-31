import { Routes, RouterModule } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { CustomerListComponent } from './view/customer-list/customer-list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,
    children: [
      {
        path: 'list',
        component: CustomerListComponent
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/customer/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CustomerRoutingModule {}
