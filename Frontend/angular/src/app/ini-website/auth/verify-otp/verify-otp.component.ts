import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss']
})
export class VerifyOtpComponent implements OnInit {
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

  otp: any = null;

  verifySub!: Subscription;
  email: string = '';
  status: any;
  submitting: boolean = false;
  data: any;
  countdown: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private aRoute: ActivatedRoute,
    public appContext: ApplicationContextService,
    )
     {
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

  ngOnInit() {
    this.verifySub = this.authService.signup$.subscribe(
      (data: any) => {
        this.data = data;
        if(data) {
          this.email = data.email;
        } else {
          this.router.navigate(['/auth/signup']);
        }
      }
    )


  }

  ngAfterViewInit() {

  }


  resendOtp() {
      this.http.post(`${environment.baseApiUrl}/auth/otp/generate`, {email: this.email, subject: 'Verification'})
      .subscribe((response: any) => {
        this.submitting = false;
        this.successSnackBar('OTP Sent')
      },
      errResp => {
        this.submitting = false;
        this.openSnackBar(errResp?.error?.message)
      });
  }


  onSubmit() {
    if(this.data?.status === 419) {
      const fd = {
        email: this.email,
        password: this.data.password,
        token: this.otp
   }
   this.submitting = true;
   this.http.post(`${environment.baseApiUrl}/auth/user/login`, fd)
     .subscribe((response: any) => {
       this.submitting = false;
       this.authService.setToken(response);
       this.appContext.userInformation$.next(response.user);
       this.authService.setRole(response?.user?.Tenant.length > 0 ? response?.user?.Tenant[0]?.Roles[0]?.name: 'CUSTOMER');
       if (this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')) {
        this.router.navigate([this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')]);
        this.authService.redirectUrl = '';
      } else {
        this.router.navigate(['/app/home']);
      }
     },
     errResp => {
       this.submitting = false;
       this.openSnackBar(errResp?.error?.error?.message)
     });
    }
    else {
    const fd = {
         email: this.email,
         token: this.otp
    }
    this.submitting = true;
    this.http.patch(`${environment.baseApiUrl}/auth/completeSignup`, fd)
      .subscribe((response: any) => {
        this.submitting = false;
        this.successSnackBar("Verification successful")
        this.router.navigate(['/auth/login']);
      },
      errResp => {
        this.submitting = false;
        this.openSnackBar(errResp?.error?.error?.message)
      });
    }
  }


  handeOtpChange(value: string[]): void {
    // console.log(value);
  }

  handleFillEvent(value: string): void {
    this.otp = value;
    // console.log(value);
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


  ngOnDestroy() {
    if(this.verifySub) {
      this.verifySub.unsubscribe();
    }
  }

}
