import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './sign-up.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { Crypto } from '@app/_shared/classes/Crypto';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-vendor-business',
  templateUrl: './vendor-business.component.html',
  styleUrls: ['./vendor-business.component.scss']
})
export class VendorBusinessComponent implements OnInit {
 @Input() data: any;

  signupForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;


  submitting = false;
  id: any;
  categories: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    public appContext: ApplicationContextService,
    )
     { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    // if (this.authService.isLoggedIn()) {
    //   this.router.navigate(['/app']);
    // }
    // this.authService.logout();

    this.signupForm = this.fb.group(
      {
        name: [this.data[0]?.name, [Validators.required]],
        email: [this.data[0]?.email, [Validators.required, Validators.pattern(this.commonServices.email)]],
        userId: [this.id],
        category: [this.data[0]?.category, [Validators.required]],
        address1: [this.data[0]?.Addresses[0]?.no + ' ' + this.data[0]?.Addresses[0]?.address1, [Validators.required]],
        city: [this.data[0]?.Addresses[0]?.city, [Validators.required]],
        country: [this.data[0]?.Addresses[0]?.country,[Validators.required]]
      }
    );

    this.getCategories();
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
        (response: any) => {
          this.categories = response;
          // this.total_count = response.data.length;
          this.container['categoriesLoading'] = false;
        },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
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
    //  fd.country = fd?.country?.code;
     fd.Addresses = [{
         country: fd.country,
         city: fd.city,
         address1: fd.address1
     }];
     delete fd.country;
     delete fd.city;
     delete fd.address1;

     this.http.post(`${environment.baseApiUrl}/auth/tenant/complete`, fd,)
       .subscribe((response: any) => {
         this.submitting = false;
        //  this.authService.email$.next(fd.email);
         this.successSnackBar("Business Signup successful");
        this.router.navigate(['/auth/verify-otp']);
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
