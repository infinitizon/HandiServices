import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FundPage } from './fund.page';

const routes: Routes = [
  {
    path: '',
    component: FundPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FundPageRoutingModule {}
