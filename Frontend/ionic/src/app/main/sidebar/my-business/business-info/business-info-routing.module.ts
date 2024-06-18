import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessInfoPage } from './business-info.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessInfoPageRoutingModule {}
