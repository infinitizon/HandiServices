import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignUpContinueComponent } from './auth/sign-up-continue/sign-up-continue.component';
import { SuccessfulPageComponent } from './auth/successful-page/successful-page.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { GetInTouchComponent } from './auth/get-in-touch/get-in-touch.component';
import { TermsComponent } from './auth/terms/terms.component';
import { UserCategoryComponent } from './auth/user-category/user-category.component';
import { ChangeEmailComponent } from './auth/change-email/change-email.component';
import { SetupProfileComponent } from './auth/setup-profile/setup-profile.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'user-category', component: UserCategoryComponent },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      // { path: 'signup-continue', component: SignUpContinueComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token-details', component: ResetPasswordComponent },
      { path: 'reset-password-successful', component: SuccessfulPageComponent},
      { path: 'verify-otp', component: VerifyOtpComponent},
      // { path: 'get-in-touch', component: GetInTouchComponent},
      // { path: 'terms', component: TermsComponent},
      { path: 'change-email', component: ChangeEmailComponent },
      // { path: 'setup-profile', component: SetupProfileComponent },
      { path: '', redirectTo: 'user-category', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/auth/user-category', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniWebsiteRoutingModule { }
