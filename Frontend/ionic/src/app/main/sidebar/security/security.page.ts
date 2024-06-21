import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Crypto } from '@app/_shared/classes/Crypto';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { StorageService } from '@app/_shared/services/storage.service';
import { environment } from '@environments/environment';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { FormErrors, ValidationMessages } from './vPassword.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { ILogin } from '@app/_shared/models/Login';
import { IOTPVerified } from '@app/_shared/models/otp.model';
import { Subscription, take } from 'rxjs';


@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage {

  vPwdForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  container = {
    setting2fa: false,
    twoFA: false,
    fingerprint: false,
    password: true,
    requireOTP: false,
    loggin: false,
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
    private appCtx: ApplicationContextService,
    private commonService: CommonService,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storageService: StorageService,
  ) { }

  ionViewWillEnter() {
    this.appCtx.getUserInformation()
        .pipe(take(1))
        .subscribe(val=>{
          this.container.twoFA=val?.twoFactorAuth
        })
    this.storageService.get('useFingerprint').then(value=>{
      this.container.fingerprint = value;
    })
    this.vPwdForm = this.fb.group({
      password: [null, [Validators.required]],
    });
  }

  async on2fa(event: any) {
    const loadingEl = await this.loadingCtrl.create({
      message: `Please wait...`
    });
    loadingEl.present();
    this.http
      .patch(`${environment.baseApiUrl}/users/profile/update`, {twoFactorAuth: event.detail.checked})
      .subscribe({
        next: async (response: any) => {
          await loadingEl.dismiss();
          this.container['twoFA'] = event.detail.checked;
          this.appCtx.userInformation$.next(response.data);
        },
        error: async (errResp) => {
          await loadingEl.dismiss();
          console.log(errResp);
        }
      });
  }
  onBiomericLogin(event: any, modalPwd: IonModal) {
    if(!event.detail.checked) {
      this.appCtx.loadBiometricSecret().then(async val=>{
        await this.storageService.set('user', val)
        await this.storageService.set('useFingerprint', false)
        this.container.fingerprint = event.detail.checked;
      })
    } else {
        modalPwd.present();
    }
  }

  onPwdVerify(modalPwd: IonModal) {

    this.vPwdForm.markAllAsTouched();
    if (this.vPwdForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.vPwdForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.vPwdForm.value));
    const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);

    this.container.loggin = true;
    this.loginSub$ = this.appCtx.getUserInformation()
        .subscribe(user=>{
          fd.email = user.email,
          fd.password = encrypted,
          this.http.post(`${environment.baseApiUrl}/auth/user/login`, fd)
              .subscribe({
                next: async (response: Partial<ILogin>)=>{
                  this.container.loggin = false;
                  this.successLogin(response, modalPwd);
                }, error: async err =>{
                  this.container.loggin = false;
                  if(err?.status !== 423 && err?.status !== 419) {
                    this.loginSub$.unsubscribe()
                    const toast = await this.toastCtrl.create({ header: 'Error', duration: 3000, color: 'danger', message: err?.error?.error?.message });
                    await toast.present()
                  }
                  if(err?.status === 419) {
                    console.log("Status: ", err.status);
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
        )
  }
  verifiedOTP(response: IOTPVerified, modal2FA: IonModal, modalPwd: IonModal) {
    this.successLogin(response.data, modalPwd);
    modal2FA.dismiss()
  }
  successLogin(response: any, modalPwd: IonModal) {
    this.loginSub$.unsubscribe()
    modalPwd.dismiss()
    if (response?.multiTenant) {
    } else {
        const user = response.user;
        this.storageService.set('token', response.token);
        this.storageService.set('uuid', response.xUUIDToken);
        this.storageService.set('role', user?.Tenant[0]?.Roles[0]?.name ?? 'CUSTOMER');
        // this.storageService.set('user',this.authData);
        this.appCtx.userInformation$.next(user);

        let fd = JSON.parse(JSON.stringify(this.vPwdForm.value));
        fd.password = new Crypto({
          aesKey: environment.SECRET_KEY,
          ivKey: environment.IV_KEY,
        }).encryptWithKeyAndIV(fd.password);
        fd.email = user.email
        this.appCtx.registerBiometricSecret(fd).then(async val=>{
          await this.storageService.set('useFingerprint', true)
        })
    }
  }
}
