import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { Crypto } from '@app/_shared/classes/Crypto';
import { FormErrors, ValidationMessages } from './sign-up.validators';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { Subscription, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-vendor-info',
  templateUrl: './vendor-info.component.html',
  styleUrls: ['./vendor-info.component.scss']
})
export class VendorInfoComponent implements OnInit {
  @Input() data: any;

  signupForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  userInformation!: any;

  submitting = false;
  infoSubscription$!: Subscription;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public appContext: ApplicationContextService,
    public aRoute: ActivatedRoute
    )
     { }

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        firstName: [this.data[0]?.TenantUserRoles[0]?.User?.firstName, [Validators.required]],
        lastName: [this.data[0]?.TenantUserRoles[0]?.User?.lastName, [Validators.required]],
        email: [this.data[0]?.TenantUserRoles[0]?.User?.email, [Validators.required, Validators.pattern(this.commonServices.email)]],
        phone: [this.data[0]?.TenantUserRoles[0]?.User?.phone, [Validators.required]],
        // password: [
        //   '',
        //   [
        //     Validators.required,
        //     Validators.minLength(6),
        //     this.commonServices.regexValidator(
        //       new RegExp(this.commonServices.oneDigit),
        //       { oneDigit: '' }
        //     ),
        //     this.commonServices.regexValidator(
        //       new RegExp(this.commonServices.oneLowerCase),
        //       { oneLowerCase: '' }
        //     ),
        //     this.commonServices.regexValidator(
        //       new RegExp(this.commonServices.oneUpperCase),
        //       { oneUpperCase: '' }
        //     ),
        //     this.commonServices.regexValidator(
        //       new RegExp(this.commonServices.specialChar),
        //       { specialChar: '' }
        //     ),
        //   ],
        // ],
        // confirmPassword: ['', [Validators.required]],
        // referralCode: ['']
      }
      // ,
      // { validators: this.commonServices.mustMatch('password', 'confirmPassword') }
    );


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

    //  const encrypted = new Crypto({
    //   aesKey: environment.SECRET_KEY,
    //   ivKey: environment.IV_KEY,
    // }).encryptWithKeyAndIV(fd.password);

    // fd.password = encrypted;
    // delete fd.confirmPassword;

     this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd,)
       .subscribe((response: any) => {
         this.submitting = false;
        //  this.authService.email$.next(fd.email);
         this.successSnackBar("Vendor updated successfully")
        //  this.router.navigate(['/vendors-onboarding/signup-continue/', response.user?.id]);
       },
       errResp => {
          this.submitting = false;
         this.openSnackBar(errResp?.error?.error?.message)
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
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['success'],
    });
  }
}

