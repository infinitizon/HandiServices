import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsComponent } from './vendors.component';
import { SharedModule } from '@app/_shared/shared.module';
import { VendorsListComponent } from './view/vendors-list/vendors-list.component';
import { VendorsRoutingModule } from './vendors-routing.module';
import { DetailsContainerComponent } from './details/details-container/details-container.component';
import { VendorBusinessComponent } from './details/vendor-business/vendor-business.component';
import { VendorInfoComponent } from './details/vendor-info/vendor-info.component';
import { VendorUsersListComponent } from './view/vendor-users-list/vendor-users-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    VendorsRoutingModule
  ],
  declarations: [
    VendorsComponent,
    VendorsListComponent,
    VendorUsersListComponent,
    DetailsContainerComponent,
    VendorBusinessComponent,
    VendorInfoComponent
  ]
})
export class VendorsModule { }
