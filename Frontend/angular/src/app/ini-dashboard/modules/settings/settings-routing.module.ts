import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { ViewSettingsComponent } from './view/view-settings/view-settings.component';
import { ProfileComponent } from './view/profile/profile.component';
import { CardsComponent } from './view/cards/cards.component';
import { NotificationAndSecurityComponent } from './view/notification-and-security/notification-and-security.component';
import { AddCscsComponent } from './create/add-cscs/add-cscs.component';
import { RequestCscsComponent } from './create/request-cscs/request-cscs.component';
import { TermsComponent } from './create/request-cscs/terms/terms.component';
const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'view',
        component: ViewSettingsComponent,
        children: [
          {
            path: 'profile',
            component: ProfileComponent,
          },
          {
            path: 'cards',
            component: CardsComponent,
          },
          {
            path: 'notifications-security',
            component: NotificationAndSecurityComponent,
          },
          { path: '', redirectTo: 'profile', pathMatch: 'full' }
        ]
      },
      {
         path: 'add-cscs',
         component: AddCscsComponent
      },
      {
        path: 'terms',
        component: TermsComponent
     },
      {
        path: 'request-cscs',
        component: RequestCscsComponent
     },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/settings/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
