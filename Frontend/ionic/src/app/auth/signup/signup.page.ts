import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatStepper } from '@angular/material/stepper';
import { IonIntlTelInputValidators } from '@jongbonga/ion-intl-tel-input';

import { FormErrors, ValidationMessages } from './signup-start.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  signupStartForm!: FormGroup;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    password: true,
    submitStart: false
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.signupStartForm = this.fb.group({
      firstName: [ null, [Validators.required],],
      lastName: [ null, [Validators.required]],
      email: [ null, [Validators.required, Validators.pattern(this.commonService.email)], ],
      phone: [ null, [Validators.required, IonIntlTelInputValidators.phone],],
      referral: [ null,],
    });
  }

  moveStepper(stepper: MatStepper, direction?: string) {
    console.log(direction, stepper);
    if(direction=='previous') stepper.previous()
    else stepper.next();
  }
  onSubmitStart(stepper: MatStepper, direction?: string) {
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

    this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd,)
      .subscribe({
        next: (response: any) => {
          this.container['submitStart'] = false;
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
}
