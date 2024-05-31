import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/_shared/shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrderListComponent } from './view/order-list/order-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OrdersRoutingModule
  ],
  declarations: [
    OrdersComponent,
    OrderListComponent
  ]
})
export class OrdersModule { }
