import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxComponent } from './inbox.component';
import { SharedModule } from '@app/_shared/shared.module';
import { InboxRoutingModule } from './inbox-routing.module';
import { ViewInboxComponent } from './view/view-inbox/view-inbox.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InboxRoutingModule
  ],
  declarations: [
    InboxComponent,
    ViewInboxComponent,
  ]
})
export class InboxModule { }
