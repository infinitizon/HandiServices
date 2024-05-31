import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IniWebsiteComponent } from './ini-website.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { IniWebsiteRoutingModule } from './ini-website-routing.module';
import { SharedModule } from '@app/_shared/shared.module';
import { SignUpContinueComponent } from './auth/sign-up-continue/sign-up-continue.component';
import { SuccessfulPageComponent } from './auth/successful-page/successful-page.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { GetInTouchComponent } from './auth/get-in-touch/get-in-touch.component';
import { TermsComponent } from './auth/terms/terms.component';
import { AuthLeftBarComponent } from './auth/auth-left-bar/auth-left-bar.component';
import { UserCategoryComponent } from './auth/user-category/user-category.component';
import { ChangeEmailComponent } from './auth/change-email/change-email.component';
import { SetupProfileComponent } from './auth/setup-profile/setup-profile.component';

@NgModule({
  imports: [
    CommonModule,
    IniWebsiteRoutingModule,
    SharedModule
  ],
  declarations: [
    IniWebsiteComponent,
    LoginComponent,
    SignUpComponent,
    SignUpContinueComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SuccessfulPageComponent,
    VerifyOtpComponent,
    GetInTouchComponent,
    TermsComponent,
    AuthLeftBarComponent,
    UserCategoryComponent,
    ChangeEmailComponent,
    SetupProfileComponent
  ]
})
export class IniWebsiteModule { }
