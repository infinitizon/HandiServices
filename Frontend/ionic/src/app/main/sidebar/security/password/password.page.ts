import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingController, NavController, ToastController } from '@ionic/angular';

import { Crypto } from '@app/_shared/classes/Crypto';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';

import { FormErrors, ValidationMessages } from './password.validators';

@Component({
  selector: 'app-password',
  templateUrl: './password.page.html',
  styleUrls: ['./password.page.scss'],
})
export class PasswordPage implements OnInit {
  container = {
    oldPassword: true,
    password: true,
    confirmPassword: true
  };
  errors: any = [];
  resetPasswordForm!: FormGroup;
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group(
      {
        oldPassword: ['',    Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            this.commonService.regexValidator( new RegExp(this.commonService.oneDigit), { oneDigit: '' } ),
            this.commonService.regexValidator( new RegExp(this.commonService.oneLowerCase), { oneLowerCase: '' } ),
            this.commonService.regexValidator( new RegExp(this.commonService.oneUpperCase), { oneUpperCase: '' } ),
            this.commonService.regexValidator( new RegExp(this.commonService.specialChar), { specialChar: '' } ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.commonService.mustMatch('password', 'confirmPassword'), } as AbstractControlOptions
    );
  }

  onSubmit() {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.resetPasswordForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      console.log(this.uiErrors, this.errors, this.resetPasswordForm);
      return;
    }
    let fd = JSON.parse(JSON.stringify(this.resetPasswordForm.value));
    fd = {
      oldPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(fd.oldPassword),
      newPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(fd.password),
      confirmNewPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(fd.confirmPassword),
    };

    const toastData = {
      header: 'Success',
      duration: 3000,
      color: 'success',
    };
    this.loadingCtrl.create({
      message: `Changing...`
    }).then(loadingEl=>{
      loadingEl.present();
      this.http.post(`${environment.baseApiUrl}/auth/change-password`,  fd)
      .subscribe({
        next: async (response: any) => {
          loadingEl.dismiss();
        const toast = await this.toastCtrl.create({
          ...toastData,
          message: response?.message + '\nChange will take effect on next login'
        });
        await toast.present()
        this.navCtrl.back();
      },
      error: async errResp => {
        loadingEl.dismiss();
        const toast = await this.toastCtrl.create({
          ...toastData,
          header: 'Error',
          color: 'danger',
          message: errResp?.error?.error.message || `Error changing password`
        });
        await toast.present()
        this.resetPasswordForm.reset();
      }
    });
    })
  }
}
