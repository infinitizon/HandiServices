import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AlertController, IonInput, IonModal, LoadingController, NavController, ToastController } from '@ionic/angular';
import { MatStepper } from '@angular/material/stepper';
import { IonIntlTelInputValidators } from '@jongbonga/ion-intl-tel-input';

import { Crypto } from '@app/_shared/classes/Crypto';
import { FormErrors, ValidationMessages } from './signup-start.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { IOTPVerified } from '@app/_shared/models/otp.model';
import { StorageService } from '@app/_shared/services/storage.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { IAddress } from '@app/_shared/models/address.interface';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  @ViewChild('modalCategory') modalCategory!: IonModal;
  @ViewChild('address', {read: IonInput}) address!: IonInput;

  signupStartForm!: FormGroup;
  signupPasswordForm!: FormGroup;
  signupVendorForm!: FormGroup;

  OTPVerified!: IOTPVerified;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    showforms: false,
    password: true,
    cPassword: true,
    submitStart: false,
    submitComplete: false,
    OTPOptions: {
      id: null,
      email: ''
    },
    categoriesLoading: false,
    showVendorForm: false,
    loggedIn: '',
    loadedMaps: false,
    countdown: 20,
  }
  selectedCategory: any
  selectedAddress!: IAddress
  categorySearchOptions = {
    endpoint: `${environment.baseApiUrl}/products/category`,
    searchType: 'GET',
    title: 'Choose Category',
    key: 'id', label: 'title',
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private appCtx: ApplicationContextService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private renderer: Renderer2,
    private gMapService: GMapService,
  ) {
  }

  ionViewDidEnter () {
    let interval = setInterval(()=>{
      this.container.countdown--
      if(this.container['loadedMaps']) {
        clearInterval(interval);
        this.container.countdown = -1;
      }
      if(this.container.countdown === 0) window.location.reload()
    }, 1000);
    this.gMapService.api.then(async (maps) => {
      this.container['loadedMaps'] = true;
      const input = await this.address?.getInputElement();

      this.initAutocomplete(maps, input);
      this.renderer.setProperty(this.address, 'placeholder', 'Search and pick your address here...');
    });
  }
  initAutocomplete(maps: Maps, input: any) {
    console.log(maps, input);

    const autocomplete = new maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const  place  =  autocomplete.getPlace();
      this.selectedAddress= this.gMapService.getAddresses(place?.address_components);
      this.selectedAddress= {...this.selectedAddress, geometry: {lng: place?.geometry?.location?.lng(), lat: place?.geometry?.location?.lat()}}
    });
  }

  async ionViewWillEnter() {
    this.container.showVendorForm = await this.storageService.get('vendor');
    this.container.loggedIn = await this.storageService.get('token');
    if(this.container.showVendorForm) {
      // this.getCategories()
    }
    this.container.showforms = true;
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

    this.appCtx.userInformation$.subscribe(user=>{
      console.log(user);
      this.signupVendorForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.commonService.email)]],
        userId: [this.container.OTPOptions.id || user?.id],
        category: ['', [Validators.required]],
        address: ['', [Validators.required]],
      });
    })
  }

  moveStepper(stepper: MatStepper, direction?: string) {
    if(direction=='previous') stepper.previous()
    else stepper.next();
  }
  verifiedOTP(data: IOTPVerified, stepper: MatStepper) {
    this.OTPVerified = data;
    this.onSubmitOTP(stepper);
  }
  onSubmitOTP(stepper: MatStepper) {
    if(!this.OTPVerified.verified) return;
    this.moveStepper(stepper);
  }
  onSelectCategory(data: any) {
    this.selectedCategory = data;
    this.signupVendorForm.patchValue({
      category: this.selectedCategory['title']
    });
    console.log(`Receiving`, data, this.modalCategory);
    this.modalCategory.dismiss();
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
          this.container.OTPOptions = response.user;
          this.signupVendorForm.patchValue({ userId: response.user.id, })
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
  async onComplete(stepper: MatStepper, direction?: string) {
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
      message: this.container.showVendorForm ? `Updating your profile...`: 'Completing signup...',
    });
    loadingEl.present();

    let fd = JSON.parse(JSON.stringify(this.signupPasswordForm.value));
    const encrypt = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    });
    ;
    fd.email = this.container.OTPOptions?.email;
    fd.password = encrypt.encryptWithKeyAndIV(fd.password);
    fd.cPassword = encrypt.encryptWithKeyAndIV(fd.cPassword);
    this.http.patch(`${environment.baseApiUrl}/auth/signup/complete`, fd)
      .subscribe({
        next: async (response: any) => {
          this.container['submitComplete'] = false;
          loadingEl.dismiss();
          if(!this.container.showVendorForm) {
            this.navCtrl.navigateForward(`/auth/login`);
            const toast = await this.toastCtrl.create({
              header: 'Success',
              duration: 3000,
              color: 'success',
              message: `Signup complete. Proceed to login`
            });
            await toast.present()
          } else {
            this.moveStepper(stepper, direction);
          }
        },
        error: async err => {
          this.container['submitComplete'] = false;
          loadingEl.dismiss();
          const toast = await this.toastCtrl.create({
            header: 'Error',
            duration: 3000,
            color: 'danger', position: 'top',
            message: err?.error?.message || `Error updating your password. Try doing a password reset or contact admin`
          });
          await toast.present()
        }
     });
  }
  async onSubmitVendor() {
    this.signupVendorForm.markAllAsTouched();
    if (this.signupVendorForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.signupVendorForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
    //  this.submitting = false;
      return;
    }

    const fd = JSON.parse(JSON.stringify(
      this.signupVendorForm.value
    ));
    fd.Addresses = [{
      no: this.selectedAddress?.number,
      address1: this.selectedAddress?.address1,
      address2: this.selectedAddress?.address2,
      city: this.selectedAddress?.city,
      lga: this.selectedAddress?.lga,
      state: this.selectedAddress?.state?.code,
      country: this.selectedAddress?.country?.code,
      lng: this.selectedAddress?.geometry?.lng,
      lat: this.selectedAddress?.geometry?.lat,
    }];
    delete fd.address;
    fd.category = this.selectedCategory.id;
    const loadingEl = await this.loadingCtrl.create({
      message: this.container.showVendorForm ? `Updating...`: 'Completing signup...',
    });
    loadingEl.present();
      this.http.post(`${environment.baseApiUrl}/auth/tenant/complete`, fd,)
        .pipe(take(1))
        .subscribe({
          next: async (response: any) => {
            await loadingEl.dismiss();
            this.navCtrl.navigateForward(this.container.loggedIn ? '/main/home' : `/auth/login`);
            const toast = await this.toastCtrl.create({
              header: 'Success',
              duration: 3000,
              color: 'success',
              message: `Signup complete. ${this.container.loggedIn ? 'You can proceed to configure your business' : 'Proceed to login'}`
            });
            await toast.present()
          },
          error: async err => {

            await loadingEl.dismiss();
            const toast = await this.toastCtrl.create({
              header: 'Error',
              duration: 3000,
              color: 'danger', position: 'top',
              message: err?.error?.message || err?.error?.error?.message || `Error updating your password. Try doing a password reset or contact admin`
            });
            await toast.present()
          }
       });

  }
  async ionViewWillLeave() {
    await this.storageService.remove('vendor');
  }
}
