import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { NgOtpInputComponent } from 'ng-otp-input';
import { take } from 'rxjs';
import { IOTP, IOTPVerified } from '../../models/otp.model';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OTPComponent implements OnInit {
  @ViewChild(NgOtpInputComponent, { static: false}) ngOtpInputRef!:NgOtpInputComponent;
  @Input() options!: IOTP;
  @Output() verified = new EventEmitter<IOTPVerified>();
  data: any;
  container={
    generating: false,
    verifyOTP: '',
  }
  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController
  ) { }

  ngOnInit(): void {
    if(!this.options?.email) {
      this.verified.emit({verified: false, error: `No email is provided`})
    }
    this.generateOTP()
  }

  generateOTP() {
    this.container['generating'] = true;
    // this.ngOtpInputRef.setValue('');
    this.http.post(`${environment.baseApiUrl}/auth/otp/generate`, {email: this.options?.email})
    .subscribe({
      next: (response: any) => {
        this.container['generating'] = false;
        // this.toastr.success(response.message, response.status);
      },
      error: err => {
        this.container['generating'] = false;
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

  onOtpChange(otp: string) {
    if(otp.length == 6) {
      this.container['verifyOTP'] = 'Verifying...';
      this.ngOtpInputRef.otpForm.disable();
      // if(this.data.status === 423) {
        const payload = {email: this.options?.email, token: otp,};
        // console.log(payload);
        this.http
        .post(this.options?.endpoint || `${environment.baseApiUrl}/auth/otp/verify`, payload)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if(response.success) this.verified.emit({verified: true})
          },
          error: (err) => {
            this.container['verifyOTP'] = err.error.message || 'Error Validating';
            this.verified.emit({verified: false, error: this.container['verifyOTP']})
            this.ngOtpInputRef.otpForm.enable();

          }
        })
      // }
    }
  }
}
