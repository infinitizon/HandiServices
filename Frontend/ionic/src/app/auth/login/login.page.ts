import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio';
import { Crypto } from '@app/_shared/classes/Crypto';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';

import { StorageService } from '@app/_shared/services/storage.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { ILogin } from '@app/_shared/models/Login';
import { FormErrors, ValidationMessages } from './login.validators';
import { ToastController } from '@ionic/angular';

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
    submitting: false
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private commonService: CommonService,
    private storageService: StorageService,
    public appContext: ApplicationContextService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [
        null,
        [Validators.required, Validators.pattern(this.commonService.email)],
      ],
      password: [null, [Validators.required, Validators.minLength(8)]],
      rememberMe: [null],
    });
    this.authByFingerPrint();
  }

  authByFingerPrint() {
    FingerprintAIO.isAvailable()
                  .then(()=>{
                    FingerprintAIO.show({
                      title: 'Authentication required',
                      subtitle: 'Verify identity',
                      description: 'Unlock using fingerprints',
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    }).then(val=>{
                      console.log(JSON.stringify(val));
                    }, err=>{
                      console.log(JSON.stringify(err));
                    })
                  }, err=>{
                    console.log(`Fingerprint not available`);
                  })
  }
  registerBiometricSecret(mySecret: any) {
    FingerprintAIO.isAvailable()
                  .then(()=>{
                    FingerprintAIO.registerBiometricSecret({
                      title: 'Authentication required 1',
                      subtitle: 'Verify identity',
                      description: 'Unlock using fingerprints',
                      secret: mySecret,
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    }).then(val=>{
                      console.log(JSON.stringify(val));
                    }).catch( err=>{
                      console.log(JSON.stringify(err));
                    })
                  })
  }
  loadBiometricSecret() {
    FingerprintAIO.isAvailable()
                  .then(()=>{
                    FingerprintAIO.loadBiometricSecret({
                      title: 'Authentication required 1',
                      subtitle: 'Verify identity',
                      description: 'Unlock using fingerprints',
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    }).then(val=>{
                      console.log(JSON.stringify(val));
                    }).catch( err=>{
                      console.log(JSON.stringify(err));
                    })
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
    console.log(fd);

    this.container['submitting'] = true;
    this.http.post(`${environment.baseApiUrl}/auth/user/login`, fd)
              .subscribe({
                next: (response: Partial<ILogin>)=>{
                  if (response?.multiTenant) {
                  } else {
                      const user = response.user;
                      this.storageService.set('token', response.token);
                      this.storageService.set('uuid', response.xUUIDToken);
                      this.storageService.set('role', user?.Tenant[0]?.Roles[0]?.name ?? 'CUSTOMER');
                      this.appContext.userInformation$.next(user);

                    // if (this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')) {
                    //   this.router.navigate([this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')]);
                    //   this.authService.redirectUrl = '';
                    // } else {
                      this.router.navigateByUrl('/main/home');
                    // }
                  }
                }, error: async err =>{
                  const toast = await this.toastCtrl.create({
                    header: 'Error',
                    duration: 3000,
                    color: 'error',
                    message: err?.error?.message
                  });
                  await toast.present()
                }
            })
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
