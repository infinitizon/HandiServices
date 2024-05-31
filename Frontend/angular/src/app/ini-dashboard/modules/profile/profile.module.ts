import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '@app/_shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileContainerComponent } from './profile-container/profile-container.component';
import { PersonalInfoComponent } from './profile-container/personal-info/personal-info.component';
import { SecurityComponent } from './profile-container/security/security.component';
import { MyOrdersComponent } from './profile-container/my-orders/my-orders.component';
import { ReferralsComponent } from './profile-container/referrals/referrals.component';
import { AddressesComponent } from './profile-container/addresses/addresses.component';
import { OrderChatComponent } from './profile-container/my-orders/order-chat/order-chat.component';
import { OrderDetailComponent } from './profile-container/my-orders/order-chat/order-detail/order-detail.component';
import { ChatComponent } from './profile-container/my-orders/order-chat/chat/chat.component';

import { environment } from '@environments/environment';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule,
    ScrollingModule,
  ],
  declarations: [
    ProfileComponent,
    ProfileContainerComponent,
    PersonalInfoComponent,
    SecurityComponent,
    MyOrdersComponent, OrderChatComponent, OrderDetailComponent, ChatComponent,
    ReferralsComponent,
    AddressesComponent
  ]
})
export class ProfileModule { }
