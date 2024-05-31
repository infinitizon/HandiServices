import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from '../sign-up/sign-up.validators';

@Component({
  selector: 'app-sign-up-continue',
  templateUrl: './sign-up-continue.component.html',
  styleUrls: ['./sign-up-continue.component.scss'],
})
export class SignUpContinueComponent implements OnInit {

  signupForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(private fb: FormBuilder, private commonServices: CommonService) {}

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        motherMaidenName: ['', [Validators.required]],
        placeOfBirth: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.commonServices.email)]],
        phone: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneDigit),
              { oneDigit: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneLowerCase),
              { oneLowerCase: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneUpperCase),
              { oneUpperCase: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.specialChar),
              { specialChar: '' }
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.commonServices.mustMatch('password', 'confirmPassword') }
    );
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  clearPassword(field: string) {
    this.signupForm.get(field)?.patchValue('')
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.signupForm.get(ctrlName) as FormControl);
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control: any) => {
      Object.keys(this.errors[control]).forEach((error: any) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      })
    });
  }
}
