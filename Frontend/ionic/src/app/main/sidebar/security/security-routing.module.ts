import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityPage } from './security.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityPage
  },  {
    path: 'password',
    loadChildren: () => import('./password/password.module').then( m => m.PasswordPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityPageRoutingModule {}
