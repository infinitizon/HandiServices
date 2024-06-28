import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IOTP } from './otp.model';
import { NgxOtpInputComponent, NgxOtpInputConfig } from 'ngx-otp-input';
import * as moment from 'moment';
import { environment } from '@environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { take } from 'rxjs';
@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  @ViewChild(NgxOtpInputComponent, { static: false}) ngOtpInputRef!:NgxOtpInputComponent;
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  };

  @Input() options!: IOTP;
  @Output() verified = new EventEmitter<boolean>(false);
  data: any;
  countdown: any;
  container={
    generating: false,
    verifyOTP: '',
  }
  otp: any = null;
  submitting: boolean = false;
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
  ) {
    const duration = moment.duration(600, 's');

    const intervalId = setInterval(() => {
      duration.subtract(1, "s");

      const inMilliseconds = duration.asMilliseconds();

      // "mm:ss:SS" will include milliseconds
      this.countdown = moment.utc(inMilliseconds).format("mm:ss")

      if (inMilliseconds !== 0) return;

      clearInterval(intervalId);
      this.countdown = "Otp expired!, Resend"
      // console.warn("Times up!");
    }, 1000);
  }

  handeOtpChange(value: string[]): void {
    // console.log(value);
  }

  handleFillEvent(value: string): void {
    this.otp = value;
    // console.log(value);
  }

  ngOnInit() {
    this.generateOTP();
  }


  generateOTP() {
    this.container['generating'] = true;
    this.submitting = true;
    // this.ngOtpInputRef.setValue('');
    this.http.post(`${environment.baseApiUrl}/auth/otp/generate`, {email: this.options?.user?.email})
    .subscribe({
      next: (response: any) => {
        this.container['generating'] = false;
            this.submitting = false;
        this.successSnackBar('OTP Sent')
        // this.toastr.success(response.message, response.status);
      },
      error: err => {
        this.container['generating'] = false;
        this.submitting = false;
        this.openSnackBar(err?.error?.message)
        // this.toastr.error(response.error.error.message);
      }
    });
  }

  // onResendCode(otp: string) {
  //   this.container['resendOTP'] = true;
  //   const payload = {token: otp,};
  //   this.ngOtpInputRef.setValue('');
  //   this.http.post(`${environment.baseApiUrl}/auth/customers/resend-otp}`, payload)
  //   .subscribe({
  //     next: (response: any) => {
  //       this.container['resendOTP'] = false;
  //       // this.toastr.success(response.message, response.status);
  //     },
  //     error: err => {
  //       this.container['resendOTP'] = false;
  //       // this.toastr.error(response.error.error.message);
  //     }
  //   });
  // }


  back() {
    // this.dialogRef.close(null);
  }

  onOtpChange(otp?: any) {
    if(otp.length == 6) {
      this.submitting = true;
      this.container['verifyOTP'] = 'Verifying...';
        const payload = {email: this.options?.user?.email, token: otp, password: this.options?.password};
        this.http
        .post(`${environment.baseApiUrl}` + this.options.endpoints, payload)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if(response.success) this.verified.emit(true)
              this.submitting = false;
          },
          error: (err) => {
            this.container['verifyOTP'] = err.error.message || 'Error Validating';
            this.submitting = false;
            // this.ngOtpInputRef.otpForm.enable();

          }
        })
      // }
    }
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
