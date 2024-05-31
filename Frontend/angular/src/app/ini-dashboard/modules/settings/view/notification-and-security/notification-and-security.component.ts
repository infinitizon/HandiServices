import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import {
  FormErrors,
  ValidationMessages,
} from './notification-and-security.validators';

@Component({
  selector: 'app-notification-and-security',
  templateUrl: './notification-and-security.component.html',
  styleUrls: ['./notification-and-security.component.scss'],
})
export class NotificationAndSecurityComponent implements OnInit {
  enableN: boolean = false;
  enableT: boolean = false;

  showPassword: boolean = false;

  resetPasswordForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  constructor(private fb: FormBuilder, private commonServices: CommonService) {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group(
      {
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
      {
        validators: this.commonServices.mustMatch(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  enableNotify() {
    this.enableN = !this.enableN;
  }

  enable2Factor() {
    this.enableT = !this.enableT;
  }

  expandPassword() {
    this.showPassword = !this.showPassword;
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  clearPassword(field: string) {
    this.resetPasswordForm.get(field)?.patchValue('');
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.resetPasswordForm.get(ctrlName) as FormControl
    );
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
      });
    });
  }
}
