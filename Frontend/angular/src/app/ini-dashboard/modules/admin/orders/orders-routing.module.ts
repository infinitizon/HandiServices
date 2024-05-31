import { Routes, RouterModule } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrderListComponent } from './view/order-list/order-list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent,
    children: [
      {
        path: 'list',
        component: OrderListComponent
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/orders/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OrdersRoutingModule {}
