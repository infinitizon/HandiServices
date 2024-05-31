import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/_shared/shared.module';
import { CustomerListComponent } from './view/customer-list/customer-list.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { ProfileContainerComponent } from './dialog/profile-container/profile-container.component';
import { PersonalInfoComponent } from './dialog/profile-container/personal-info/personal-info.component';
import { MyOrdersComponent } from './dialog/profile-container/my-orders/my-orders.component';
import { AddressesComponent } from './dialog/profile-container/addresses/addresses.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CustomerRoutingModule
  ],
  declarations: [
    CustomerComponent,
    CustomerListComponent,
    ProfileContainerComponent,
    PersonalInfoComponent,
    MyOrdersComponent,
    AddressesComponent
  ]
})
export class CustomerModule { }
