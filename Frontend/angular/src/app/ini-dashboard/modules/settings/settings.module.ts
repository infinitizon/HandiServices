import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '@app/_shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { ViewSettingsComponent } from './view/view-settings/view-settings.component';
import { ProfileComponent } from './view/profile/profile.component';
import { CardsComponent } from './view/cards/cards.component';
import { NotificationAndSecurityComponent } from './view/notification-and-security/notification-and-security.component';
import { AddCscsComponent } from './create/add-cscs/add-cscs.component';
import { RequestCscsComponent } from './create/request-cscs/request-cscs.component';
import { TermsComponent } from './create/request-cscs/terms/terms.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule
  ],
  declarations: [
    SettingsComponent,
    ViewSettingsComponent,
    ProfileComponent,
    CardsComponent,
    NotificationAndSecurityComponent,
    AddCscsComponent,
    RequestCscsComponent,
    TermsComponent
  ]
})
export class SettingsModule { }
