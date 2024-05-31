import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './_shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./ini-website/ini-website.module').then(m => m.IniWebsiteModule)
  },
  {
    path: 'vendors-onboarding',
    loadChildren: () => import('./ini-vendors-website/ini-vendors-website.module').then(m => m.IniVendorsWebsiteModule)
  },
  {
    path: '',
    loadChildren: () => import('./ini-dashboard/ini-dashboard.module').then(m => m.IniDashboardModule)
  },
  { path: '**', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
