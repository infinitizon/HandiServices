import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { FormErrors, ValidationMessages } from './start.validators';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent  implements OnInit {

  signupStartForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    password: true,
    submitting: false
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.signupStartForm = this.fb.group({
      firstName: [ null, [Validators.required],],
      lastName: [ null, [Validators.required]],
      email: [ null, [Validators.required, Validators.pattern(this.commonService.email)], ],
      phone: [ null, [Validators.required],],
      referral: [ null,],
    });
  }

  onSubmit() {
    this.container['submitting'] = true;
    if (this.signupStartForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.signupStartForm
      );
      // // console.log(this.uiErrors, this.errors, this.myForm);
      this.displayErrors();
      this.container['submitting'] = false;
      return;
    }

    console.log(this.signupStartForm.value);

  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control: string) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
    });
  }
}
