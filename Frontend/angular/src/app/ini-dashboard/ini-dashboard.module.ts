import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IniDashboardComponent } from './ini-dashboard.component';
import { IniDashboardRoutingModule } from './ini-dashboard-routing.module';
import { SharedModule } from '@app/_shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IniDashboardRoutingModule,
    SharedModule
  ],
  declarations: [
    IniDashboardComponent
  ]
})
export class IniDashboardModule { }
