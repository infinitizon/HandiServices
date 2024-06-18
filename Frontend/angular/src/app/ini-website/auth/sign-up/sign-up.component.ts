import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from '../sign-up/sign-up.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { Crypto } from '@app/_shared/classes/Crypto';
import { MatStepper } from '@angular/material/stepper';
import { IOTP } from '@app/_shared/components/otp/otp.model';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  @ViewChild('search') searchElementRef:  ElementRef = {
    nativeElement: undefined
  };
  signupForm!: FormGroup;
  firstForm!: FormGroup;
  secondForm!: FormGroup;
  thirdForm!: FormGroup;
  fourthForm!: FormGroup;

  container: any = {
    OTPOptions: {
      user: {},
      endpoints: '/auth/otp/verify'
    },
  };
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  OTPVerified: any;

  submitting = false;
  categories: any;
  vendorExists: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private gMapService: GMapService,
    private renderer: Renderer2,
    private aRoute: ActivatedRoute,
    )
     {
      let interval = setInterval(()=>{
        this.container.countdown--
        if(this.container['loadedMaps']) {
          clearInterval(interval);
          this.container.countdown = null
        }
        if(this.container.countdown === 0) window.location.reload()
      }, 1000)
      this.gMapService.api.then((maps) => {
        this.initAutocomplete(maps);
        this.container['loadedMaps'] = true;
        this.renderer.setProperty(this.searchElementRef.nativeElement, 'placeholder', 'Search and pick your address here...');
      });
     }

  ngOnInit() {
    this.vendorExists = this.aRoute.snapshot.paramMap.get('id');
        console.log(this.vendorExists)

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    }

    this.firstForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.commonServices.email)]],
        phone: ['', [Validators.required]],

        referralCode: ['']
      }
    );

    this.secondForm = this.fb.group(
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
      { validators: this.commonServices.mustMatch('password', 'confirmPassword') }
    );
    this.thirdForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.commonServices.email)]],
        userId: [''],
        category: ['', [Validators.required]],
        address: ['', [Validators.required]],
      }
  )

  }

  businessOnit() {
    this.container.gettingUser = true;
    this.http.get(`${environment.baseApiUrl}/users/vendor/user/${this.container?.OTPOptions?.user?.id}`)
       .subscribe({
       next: (user: any)=>{
        if(!user.data) {
          this.router.navigate(['/auth/signup/vendor']);
          this.commonServices.snackBar(`There is no user attached to this account. Please register or contact admin`, 'error');
          return;
        }
        this.container.user = user.data
        this.thirdForm.patchValue({
          userId: user?.data?.id
        });

        this.container.gettingUser = false;
      }
    })
    this.getCategories();
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  next(stepper: MatStepper) {
    if (this.firstForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonServices.findInvalidControlsRecursive(this.firstForm);
      this.displayErrors();
      this.submitting = false;
      return;
    }
    stepper.next();
  }

  verifiedOTP(data: any) {
    this.OTPVerified = data;
    this.onComplete();
  }

  onComplete() {
    if(!this.OTPVerified) return;
    this.router.navigate(['/auth/login']);
  }

  onSubmit(stepper?: MatStepper) {
    this.submitting = true;
     if (this.secondForm.invalid) {
       this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
       this.errors = this.commonServices.findInvalidControlsRecursive(this.firstForm);
       this.displayErrors();
       this.submitting = false;
       return;
     }

     const fd = JSON.parse(JSON.stringify(
       this.firstForm.value
     ));

     const pd = JSON.parse(JSON.stringify(
      this.secondForm.value
    ));

     const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(pd.password);

    pd.password = encrypted;
    delete pd.confirmPassword;

    const payload = {...fd, ...pd}

     this.http.post(`${environment.baseApiUrl}/auth/user/signup`, payload)
       .subscribe({
        next: (response: any) => {
          this.submitting = false;
          this.container.OTPOptions.user = response.user;
          //  this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd,)
          this.authService.signup$.next({email: fd.email});
          this.commonServices.snackBar(response.message || `Signup successful`);
          if(this.vendorExists) {
            this.businessOnit();
          } else {
            stepper.next();
          }

          // this.router.navigate(['/auth/verify-otp']);

        },
        error: errResp => {
            this.submitting = false;
            this.commonServices.snackBar(errResp?.error?.error?.message, 'error')
        }
      });
   }


   getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
        (response: any) => {
          this.categories = response.data;
          // this.total_count = response.data.length;
          this.container['categoriesLoading'] = false;
        },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }

   onSubmitBusiness(stepper?: MatStepper) {
    this.submitting = true;
     if (this.thirdForm.invalid) {
       this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
       this.errors = this.commonServices.findInvalidControlsRecursive(this.thirdForm);
       this.displayErrors();
       this.submitting = false;
       return;
     }

     const fd = JSON.parse(JSON.stringify(
       this.thirdForm.value
     ));
     fd.Addresses = [{
        no: this.container?.address?.number,
        address1: this.container?.address?.address1,
        address2: this.container?.address?.address2,
        city: this.container?.address?.city,
        lga: this.container?.address?.lga,
        state: this.container?.address?.state?.code,
        country: this.container?.address?.country?.code,
        lng: this.container?.address?.geometry?.lng,
        lat: this.container?.address?.geometry?.lat,
     }];
     delete fd.address;
    //  console.log(fd); return


     this.http.post(`${environment.baseApiUrl}/auth/tenant/complete`, fd,)
       .subscribe({
          next: (response: any) => {
            this.submitting = false;
            this.authService.signup$.next({email: fd.email});
            this.commonServices.snackBar("Business Signup successful");
            stepper.next();
          },
          error: errResp => {
            this.submitting = false;
            this.commonServices.snackBar(errResp?.error?.error?.message, 'error')
          }
      });
   }

  initAutocomplete(maps: Maps) {
    const autocomplete = new maps.places.Autocomplete(
      this.searchElementRef?.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      const  place  =  autocomplete.getPlace();
      this.container.address = this.gMapService.getAddresses(place?.address_components);
      this.container.address = {...this.container.address, geometry: {lng: place?.geometry?.location?.lng(), lat: place?.geometry?.location?.lat()}}
    });
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.firstForm.get(ctrlName) as FormControl);
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  controlChangedSecond(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.secondForm.get(ctrlName) as FormControl);
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  controlChangedThird(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.thirdForm.get(ctrlName) as FormControl);
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
