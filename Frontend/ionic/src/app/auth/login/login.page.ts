import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Crypto } from '@app/_shared/classes/Crypto';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';

import { StorageService } from '@app/_shared/services/storage.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { ILogin } from '@app/_shared/models/Login';
import { FormErrors, ValidationMessages } from './login.validators';
import { LoadingController, ToastController } from '@ionic/angular';
import { IOTPVerified } from '@app/_shared/models/otp.model';
import { IonModal, NavController } from '@ionic/angular/common';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container = {
    password: true,
    submitting: false,
    requireOTP: false,
    useFingerprint: false,
    OTPOptions: {
      id: null,
      email: '',
      endpoint: '',
      formData: {}
    },
  }
  loginSub$ = new Subscription();
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private navCtrl: NavController,
    private commonService: CommonService,
    private storageService: StorageService,
    public appContext: ApplicationContextService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [
        'infinitizon+9@gmail.com',
        [Validators.required, Validators.pattern(this.commonService.email)],
      ],
      password: ['123456789', [Validators.required, Validators.minLength(8)]],
      rememberMe: [null],
    });
    this.useFingetPrint();
  }
  useFingetPrint() {
    this.storageService.get('useFingerprint').then(async val=>{
      if(val) {
        this.container.useFingerprint = true;
        this.appContext.loadBiometricSecret().then(async (u: any)=>{
          const user = JSON.parse(u);
          this.loginForm.patchValue({
            email: user.email,
            password: user.password
          });
          const fd = JSON.parse(JSON.stringify(this.loginForm.value));
          await this.login(fd)
        })
      }
    })
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.loginForm);
      this.displayErrors();
      console.log(this.uiErrors);
      this.container['submitting'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.loginForm.value));
    const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);
    fd.password = encrypted;

    await this.login(fd)
  }
  async login(fd: any) {
    this.container['submitting'] = true;
    const loadingEl = await this.loadingCtrl.create({
      message: `Logging you in...`
    });
    await loadingEl.present();
    this.http.post(`${environment.baseApiUrl}/auth/user/login`, fd)
        .pipe(take(1))
        .subscribe({
          next: async (response: Partial<ILogin>)=>{
            await loadingEl.dismiss();
            this.successLogin(response);
          }, error: async err =>{
            console.log("Status: ", err);
            await loadingEl.dismiss();
            if(err?.status !== 423 && err?.status !== 419) {
              const toast = await this.toastCtrl.create({
                header: 'Error',
                duration: 3000,
                color: 'danger', position: 'top',
                message: err?.error?.error?.message
              });
              await toast.present();
              // this.loginSub$.unsubscribe()
            }
            if(err?.status === 419) {
              this.container.requireOTP = true;
              this.container.OTPOptions = {
                ...this.container.OTPOptions,
                email: fd.email,
                formData: fd,
                endpoint: `${environment.baseApiUrl}/auth/user/login`
              }
            }
          }
      })
  }
  successLogin(response: any) {
    this.loginSub$.unsubscribe()
    if (response?.multiTenant) {
    } else {
        const user = response.user;
        this.storageService.set('token', response.token);
        this.storageService.set('uuid', response.xUUIDToken);
        this.appContext.userInformation$.next(user);

      // if (this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')) {
      //   this.router.navigate([this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')]);
      //   this.authService.redirectUrl = '';
      // } else {
        this.navCtrl.navigateBack('/main/home');
      // }
    }
  }
  verifiedOTP(response: IOTPVerified, modal2FA: IonModal) {
    this.successLogin(response.data);
    modal2FA.dismiss()
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
  onTogglePassword() {
    this.container.password = !this.container.password
  }
}
