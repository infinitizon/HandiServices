import { Routes, RouterModule } from '@angular/router';
import { ProviderComponent } from './provider.component';
import { CategoryListComponent } from './view/category-list/category-list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: ProviderComponent,
    children: [
      {
        path: 'configure',
        component: CategoryListComponent
      },
      { path: '', redirectTo: 'configure', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/admin/provider/configure', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProviderRoutingModule {}
