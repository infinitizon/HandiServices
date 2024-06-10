import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatStepper } from '@angular/material/stepper';
import { IonIntlTelInputValidators } from '@jongbonga/ion-intl-tel-input';

import { FormErrors, ValidationMessages } from './signup-start.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  signupStartForm!: FormGroup;
  signupPasswordForm!: FormGroup;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    password: true,
    cPassword: true,
    submitStart: false,
    OTPVerified: false,
    OTPOptions: {
      email: ''
    },
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
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
          const alert = await this.alertCtrl.create({
            header: `Error`,
            message: err?.error?.error?.message
          });
          await alert.present()
        }
     });
  }
  verifiedOTP(data: boolean, stepper: MatStepper) {
    this.container.OTPVerified = data;
    this.onSubmitOTP(stepper);
  }
  onSubmitOTP(stepper: MatStepper) {
    if(!this.container.OTPVerified) return;
    this.moveStepper(stepper);
  }
  onComplete() {
    this.signupPasswordForm.markAllAsTouched();
    if (this.signupPasswordForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.signupPasswordForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      console.log(this.uiErrors, this.errors, this.signupPasswordForm);
      this.container['submitStart'] = false;
      return;
    }
  }
}
