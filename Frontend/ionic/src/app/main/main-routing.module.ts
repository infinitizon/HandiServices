import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'wallet',
        loadChildren: () => import('./wallet/wallet.module').then( m => m.WalletPageModule)
      }
    ]
  },
  {
    path: 'sidebar',
    loadChildren: () => import('./modals/sidebar/sidebar.module').then( m => m.SidebarPageModule)
  },
  {
    path: '',
    redirectTo: '/main/home',
    pathMatch: 'full'
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
