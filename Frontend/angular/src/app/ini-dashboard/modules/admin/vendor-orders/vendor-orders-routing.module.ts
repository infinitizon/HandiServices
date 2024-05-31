import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorOrdersComponent } from './vendor-orders.component';
import { ViewOrdersContainerComponent } from './view/view-orders/view-orders-container.component';


const routes: Routes = [
  {
    path: '',
    component: VendorOrdersComponent,
    children: [
      {
        path: 'view',
        component: ViewOrdersContainerComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/vendor-orders/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class VendorOrdersRoutingModule {}
