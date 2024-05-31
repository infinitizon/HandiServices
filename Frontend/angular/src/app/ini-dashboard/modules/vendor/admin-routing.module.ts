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
