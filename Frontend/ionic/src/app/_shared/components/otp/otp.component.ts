import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { NgOtpInputComponent } from 'ng-otp-input';
import { take } from 'rxjs';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OTPComponent implements OnInit {
  @ViewChild(NgOtpInputComponent, { static: false}) ngOtpInputRef!:NgOtpInputComponent;
  data: any;
  container={
    resendOTP: false,
    verifyOTP: '',
  }
  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController
  ) { }

  ngOnInit(): void {
    console.log();
   }


  onResendCode() {
    this.container['resendOTP'] = true;
    const payload = {};
    this.ngOtpInputRef.setValue('');
    this.http.post(`${environment.baseApiUrl}` + `${ '/auth/customers/resend-otp'}`, payload)
    .subscribe({
      next: (response: any) => {
        this.container['resendOTP'] = false;
        // this.toastr.success(response.message, response.status);
      },
      error: err => {
        this.container['resendOTP'] = false;
        // this.toastr.error(response.error.error.message);
      }
    });
  }


  back() {
    // this.dialogRef.close(null);
  }

  onOtpChange(otp: string) {
    if(otp.length == 6) {
      this.container['verifyOTP'] = 'Verifying...';
      this.ngOtpInputRef.otpForm.disable();
      // if(this.data.status === 423) {
        const payload = {token: otp,};
        // console.log(payload);
        this.http
        .post(`${environment.baseApiUrl}/auth/customers/login`, payload)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            // this.commonService.removeLoading(this.submitButton.nativeElement);
            // this.dialogRef.close({twofaSuccess: true, response: response })
            // this.appContext.userInformation = response.data;

          },
          error: (err) => {
            this.container['verifyOTP'] = err.error.message || 'Error Validating';
            // this.toastr.error(response.error.error.message);
            this.ngOtpInputRef.otpForm.enable();

          }
        })
      // }
    }
  }
}
