import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IniDashboardComponent } from './ini-dashboard.component';
import { AuthGuard } from '@app/_shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'app',
    component: IniDashboardComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
        // canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        // canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [AuthGuard]
      },
      {
      path: 'wallet',
      loadChildren: () => import('./modules/wallet/wallet.module').then(m => m.WalletModule),
      canActivate: [AuthGuard]
     },
      {
        path: 'faq',
        loadChildren: () => import('./modules/faq/faq.module').then(m => m.FaqModule),
        // canActivate: [AuthGuard]
      },
      {
        path: 'feedback',
        loadChildren: () => import('./modules/feedback/feedback.module').then(m => m.FeedbackModule),
        // canActivate: [AuthGuard]
      },
      // {
      //   path: 'offers',
      //   loadChildren: () => import('./modules/offers/offers.module').then(m => m.OffersModule),
      //   // canActivate: [AuthGuard]
      // },
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
      //   canActivate: [AuthGuard]
      // },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/home/view', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniDashboardRoutingModule { }
