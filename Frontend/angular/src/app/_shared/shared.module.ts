import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DurationFormatPipe } from './pipes/duration-format.pipe';
import { SafeHtml } from './pipes/safe-html.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './third-party/material.module';
import { BackbuttonComponent } from './components/backbutton/backbutton.component';
import { SuccessfulPageComponent } from '../ini-website/auth/successful-page/successful-page.component';
import { MessageDialogComponent } from './dialogs/message-dialog/message-dialog.component';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { SnackBarComponent } from './components/snack-bar/snack-bar.component';
import { ChatPaneComponent } from './components/chat-pane/chat-pane.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GatewayComponent } from './dialogs/gateway/gateway.component';
import { GetStartedComponent } from './dialogs/get-started/get-started.component';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { ProfileSelectComponent } from './dialogs/profile-select/profile-select.component';
import { GetRolesComponent } from './components/get-roles/get-roles.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LogInComponent } from './dialogs/log-in/log-in.component';
import { LogoutDialogComponent } from './dialogs/logout-dialog/logout-dialog.component';
import { LottieModule } from 'ngx-lottie';
import { EmptyDataComponent } from './components/empty-data/empty-data.component';
import { ColorPipe, ImagePipe } from './pipes/random-color.pipe';
import { GatewayDialogComponent } from './dialogs/gateway-dialog/gateway-dialog.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'
import { LoaderComponent } from './components/loader/loader.component';
import { AddAddressComponent } from './dialogs/add-address/add-address.component';
import { PasswordChangeComponent } from './dialogs/password-change/password-change.component';
import { ActivateEmailComponent } from './dialogs/activate-email/activate-email.component';
import { Loader2Component } from './components/loader_2/loader.component';
import { environment } from '@environments/environment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
const config: SocketIoConfig = { url: environment.SOCKET_BASE, options: {} };

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'MMM DD, YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

export function playerFactory() {
  return import(/* webpackChunkName: 'lottie-web' */ 'lottie-web');
}


@NgModule({
  declarations: [
    DurationFormatPipe,
    SafeHtml,
    BackbuttonComponent,
    SnackBarComponent, ChatPaneComponent,
    GatewayComponent,
    GetStartedComponent,
    ProfileSelectComponent,
    MessageDialogComponent,
    GetRolesComponent,
    LogInComponent,
    LogoutDialogComponent,
    EmptyDataComponent,
    ColorPipe,
    ImagePipe,
    GatewayDialogComponent,
    LoaderComponent,
    AddAddressComponent,
    ActivateEmailComponent,
    Loader2Component,
    PasswordChangeComponent
  ],
  providers: [
    provideNgxMask()
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMatIntlTelInputComponent,
    NgxOtpInputModule,
    NgApexchartsModule,
    SlickCarouselModule,
    FileUploadModule,
    NgbModule,
    LottieModule.forRoot({ player: playerFactory }),
    NgxMaskDirective, NgxMaskPipe,
    SocketIoModule.forRoot(config),
    AutocompleteLibModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,
    DurationFormatPipe, SafeHtml,
    MaterialModule,
    BackbuttonComponent,
    NgxMatIntlTelInputComponent,
    NgxOtpInputModule,
    SnackBarComponent, ChatPaneComponent,
    NgApexchartsModule,
    GatewayComponent,
    GetStartedComponent,
    ProfileSelectComponent,
    GetRolesComponent,
    SlickCarouselModule,
    NgbModule,
    LogInComponent,
    LogoutDialogComponent,
    MessageDialogComponent,
    LottieModule,
    EmptyDataComponent,
    ColorPipe,
    ImagePipe,
    GatewayDialogComponent,
    FileUploadModule,
    LoaderComponent,
    NgxMaskDirective, NgxMaskPipe,
    AddAddressComponent,
    PasswordChangeComponent,
    ActivateEmailComponent,
    Loader2Component,
    SocketIoModule,
    AutocompleteLibModule
  ]
})
export class SharedModule { }
