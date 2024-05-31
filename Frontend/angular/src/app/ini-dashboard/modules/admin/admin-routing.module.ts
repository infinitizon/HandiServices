import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'product-xter',
        loadChildren: () => import('./product-xter/product-xter.module').then(m => m.ProductXterModule),
      },
      {
        path: 'vendors',
        loadChildren: () => import('./vendors/vendors.module').then(m => m.VendorsModule),
      },
      {
        path: 'categories',
        loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule),
      },
      {
        path: 'vendor',
        loadChildren: () => import('./provider/provider.module').then(m => m.ProviderModule),
      },
      {
        path: 'customers',
        loadChildren: () => import('./customers/customer.module').then(m => m.CustomerModule),
      },
      {
        path: 'inbox',
        loadChildren: () => import('./inbox/inbox.module').then(m => m.InboxModule),
      },
      // {
      //   path: 'orders',
      //   loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule),
      // },
      {
        path: 'business-info',
        loadChildren: () => import('../admin/business-info/business-info.module').then(m => m.BusinessInfoModule),
      },
      {
        path: 'vendor-orders',
        loadChildren: () => import('../admin/vendor-orders/vendor-orders.module').then(m => m.VendorOrdersModule),
      },
      { path: '', redirectTo: 'vendors', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/vendors', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
