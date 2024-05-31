import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignUpContinueComponent } from './sign-up-continue/sign-up-continue.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'signup', component: SignUpComponent },
      { path: 'signup-continue/:id', component: SignUpContinueComponent },
      { path: 'verify-otp', component: VerifyOtpComponent},
      { path: '', redirectTo: 'signup', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/vendors-onboarding/signup', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniVendorsRoutingModule { }
