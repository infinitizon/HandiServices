import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalPage } from './personal.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalPage
  },  {
    path: 'address',
    loadChildren: () => import('./address/address.module').then( m => m.AddressPageModule)
  },
  {
    path: 'security-question',
    loadChildren: () => import('./security-question/security-question.module').then( m => m.SecurityQuestionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalPageRoutingModule {}
