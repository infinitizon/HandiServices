import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IniVendorsWebsiteComponent } from './ini-vendors-website.component';
import { SharedModule } from '@app/_shared/shared.module';
import { IniVendorsRoutingModule } from './ini-vendors-website-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignUpContinueComponent } from './sign-up-continue/sign-up-continue.component';
import { AuthLeftBarComponent } from './auth-left-bar/auth-left-bar.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    IniVendorsRoutingModule
  ],
  declarations: [
    IniVendorsWebsiteComponent,
    SignUpComponent,
    SignUpContinueComponent,
    AuthLeftBarComponent,
    VerifyOtpComponent

  ]
})
export class IniVendorsWebsiteModule { }
