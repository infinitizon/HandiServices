import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from '../sign-up/sign-up.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { Crypto } from '@app/_shared/classes/Crypto';
import { take } from 'rxjs';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signupForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;


  submitting = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    public appContext: ApplicationContextService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    )
     { }

  ngOnInit() {
    this.appContext.getUserInformation()
        .pipe(take(1))
        .subscribe({
          next: (data: any) => {
            if(data && data.id){
              this.authService.email$.next(data.email);
              this.router.navigate(['/vendors-onboarding/signup-continue/', data?.id]);
            } else {
              this.signupForm = this.fb.group(
                {
                  firstName: ['', [Validators.required]],
                  lastName: ['', [Validators.required]],
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
                  referralCode: ['']
                }
                ,
                { validators: this.commonServices.mustMatch('password', 'confirmPassword') }
              );
            }
          },
        });
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  onSubmit() {
    this.submitting = true;
     if (this.signupForm.invalid) {
       this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
       this.errors = this.commonServices.findInvalidControlsRecursive(this.signupForm);
       this.displayErrors();
       this.submitting = false;
       return;
     }

     const fd = JSON.parse(JSON.stringify(
       this.signupForm.value
     ));

     const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);

    fd.password = encrypted;
    delete fd.confirmPassword;

     this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd,)
       .subscribe({
          next: (response: any) => {
            this.submitting = false;
            this.authService.email$.next(fd.email);
            this.successSnackBar("Signup successful")
            this.router.navigate(['/vendors-onboarding/signup-continue/', response.user?.id]);
            console.log(`Vendor signup`)
          },
          error: errResp => {
              this.submitting = false;
            this.openSnackBar(errResp?.error?.error?.message)
          }
       });
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

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }

  successSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }
}
