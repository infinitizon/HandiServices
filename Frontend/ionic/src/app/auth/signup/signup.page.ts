import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatStepper } from '@angular/material/stepper';
import { IonIntlTelInputValidators } from '@jongbonga/ion-intl-tel-input';

import { FormErrors, ValidationMessages } from './signup-start.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { IOTPVerified } from '@app/_shared/models/otp.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  signupStartForm!: FormGroup;
  signupPasswordForm!: FormGroup;

  OTPVerified!: IOTPVerified;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    password: true,
    cPassword: true,
    submitStart: false,
    submitComplete: false,
    OTPOptions: {
      email: ''
    },
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.signupStartForm = this.fb.group({
      firstName: [ null, [Validators.required],],
      lastName: [ null, [Validators.required]],
      email: [ null, [Validators.required, Validators.pattern(this.commonService.email)], ],
      phone: [ null, [Validators.required, IonIntlTelInputValidators.phone],],
      referral: [ null,],
    });
    this.signupPasswordForm = this.fb.group({
      password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.commonService.regexValidator(
              new RegExp(this.commonService.oneDigit),
              { oneDigit: ValidationMessages?.['password']?.oneDigit }
            ),
            this.commonService.regexValidator(
              new RegExp(this.commonService.oneLowerCase),
              { oneLowerCase: ValidationMessages?.['password']?.oneLowerCase }
            ),
            this.commonService.regexValidator(
              new RegExp(this.commonService.oneUpperCase),
              { oneUpperCase: ValidationMessages?.['password']?.oneUpperCase }
            ),
            this.commonService.regexValidator(
              new RegExp(this.commonService.specialChar),
              { specialChar: ValidationMessages?.['password']?.specialChar }
            ),
          ],
        ],
      cPassword: [ null, [Validators.required, ]],
    }, { validators: this.commonService.mustMatch('password', 'cPassword') } as AbstractControlOptions);
  }

  moveStepper(stepper: MatStepper, direction?: string) {
    console.log(direction, stepper);
    if(direction=='previous') stepper.previous()
    else stepper.next();
  }
  async onSubmitStart(stepper: MatStepper, direction?: string) {

    // this.moveStepper(stepper, direction);return;
    this.container['submitStart'] = true;
    this.signupStartForm.markAllAsTouched();
    if (this.signupStartForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.signupStartForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      console.log(this.uiErrors, this.errors, this.signupStartForm);
      this.container['submitStart'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(
      this.signupStartForm.value
    ));
    const loadingEl = await this.loadingCtrl.create({
      message: 'Signing you up...',
    });
    loadingEl.present();
    this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd,)
      .subscribe({
        next: (response: any) => {
          this.container['submitStart'] = false;
          loadingEl.dismiss()
          this.container.OTPOptions = response.user
          this.moveStepper(stepper, direction);
        },
        error: async err => {
          this.container['submitStart'] = false;
          loadingEl.dismiss();
          const alert = await this.alertCtrl.create({
            header: `Error`,
            message: err?.error?.error?.message,
            buttons: [ { text: 'Cancel', role: 'cancel' },],
          });
          await alert.present()
        }
     });
  }
  verifiedOTP(data: IOTPVerified, stepper: MatStepper) {
    this.OTPVerified = data;
    this.onSubmitOTP(stepper);
  }
  onSubmitOTP(stepper: MatStepper) {
    if(!this.OTPVerified.verified) return;
    this.moveStepper(stepper);
  }
  async onComplete() {
    this.container['submitComplete'] = true;
    this.signupPasswordForm.markAllAsTouched();
    if (this.signupPasswordForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.signupPasswordForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      console.log(this.uiErrors, this.errors, this.signupPasswordForm);
      this.container['submitComplete'] = false;
      return;
    }
    const loadingEl = await this.loadingCtrl.create({
      message: 'Completing signup...',
    });
    loadingEl.present();
    this.http.patch(`${environment.baseApiUrl}/auth/signup/complete`, this.signupPasswordForm.value)
      .subscribe({
        next: async (response: any) => {
          this.container['submitComplete'] = false;
          loadingEl.dismiss();
          this.navCtrl.navigateForward(`/auth/login`);
          const toast = await this.toastCtrl.create({
            header: 'Success',
            duration: 3000,
            color: 'success',
            message: `Signup complete. Proceed to login`
          });
          await toast.present()
        },
        error: async err => {
          this.container['submitComplete'] = false;
          loadingEl.dismiss();
          const toast = await this.toastCtrl.create({
            header: 'Error',
            duration: 3000,
            color: 'error',
            message: err?.error?.message || `Error updating your password. Try doing a password reset or contact admin`
          });
          await toast.present()
        }
     });
  }
}
