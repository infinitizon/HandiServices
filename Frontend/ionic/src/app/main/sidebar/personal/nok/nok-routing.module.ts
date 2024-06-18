import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NokPage } from './nok.page';

const routes: Routes = [
  {
    path: '',
    component: NokPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NokPageRoutingModule {}
