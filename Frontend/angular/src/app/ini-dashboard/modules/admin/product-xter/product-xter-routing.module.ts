import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductXterComponent } from './product-xter.component';
import { CategoriesListComponent } from './view/categories-list/categories-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProductXterComponent,
    children: [
      {
        path: 'view',
        component: CategoriesListComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/product-xter/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProductXterRoutingModule {}
