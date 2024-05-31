import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessInfoComponent } from './business-info.component';
import { SharedModule } from '@app/_shared/shared.module';
import { BusinessInfoRoutingModule } from './business-info-routing.module';
import { ViewBusinessInfoComponent } from './view/view-business-info/view-business-info.component';
import { ViewBusinessInfoContainerComponent } from './view/view-business-info/view-business-info-container.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BusinessInfoRoutingModule
  ],
  declarations: [
    BusinessInfoComponent,
    ViewBusinessInfoComponent,
    ViewBusinessInfoContainerComponent
  ]
})
export class BusinessInfoModule { }
