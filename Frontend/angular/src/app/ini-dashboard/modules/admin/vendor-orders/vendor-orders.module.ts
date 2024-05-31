import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorOrdersComponent } from './vendor-orders.component';
import { VendorOrdersRoutingModule } from './vendor-orders-routing.module';
import { SharedModule } from '@app/_shared/shared.module';
import { ViewOrdersComponent } from './view/view-orders/view-orders.component';
import { ViewOrdersContainerComponent } from './view/view-orders/view-orders-container.component';

@NgModule({
  imports: [
    CommonModule,
    VendorOrdersRoutingModule,
    SharedModule
  ],
  declarations: [
    VendorOrdersComponent,
    ViewOrdersComponent,
    ViewOrdersContainerComponent
  ]
})
export class VendorOrdersModule { }
