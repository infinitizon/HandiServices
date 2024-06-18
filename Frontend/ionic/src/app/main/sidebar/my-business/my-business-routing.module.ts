import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyBusinessPage } from './my-business.page';

const routes: Routes = [
  {
    path: '',
    component: MyBusinessPage
  },
  {
    path: 'business-info',
    loadChildren: () => import('./business-info/business-info.module').then( m => m.BusinessInfoPageModule)
  },
  {
    path: 'category',
    loadChildren: () => import('./category/category.module').then( m => m.CategoryPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyBusinessPageRoutingModule {}
