import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Crypto } from '@app/_shared/classes/Crypto';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { ProfileSelectComponent } from '@app/_shared/dialogs/profile-select/profile-select.component';
import { ActivateEmailComponent } from '@app/_shared/dialogs/activate-email/activate-email.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  container: any = {};
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private aRoute: ActivatedRoute,
    public dialog: MatDialog,
    public appContext: ApplicationContextService,
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/']);
    }

    this.loginForm = this.fb.group({
      email: [
        null,
        [Validators.required, Validators.pattern(this.commonService.email)],
      ],
      password: [null, [Validators.required]],
      rememberMe: [null],
    });
  }

  onSubmit() {
    const fd = JSON.parse(JSON.stringify(this.loginForm.value));
    const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);

    fd.password = encrypted;

    this.submitting = true;
    this.http
      .post(`${environment.baseApiUrl}/auth/user/login`, fd)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          if (response?.multiTenant) {
            const profileSelectDialog = this.dialog.open(
              ProfileSelectComponent,
              {
                data: {
                  users: response?.user,
                  password: fd?.password
                },
                width: '408px',
              }
            );

            profileSelectDialog.afterClosed().subscribe((result) => {
              if (result) {
              }
            });
          } else {
            this.authService.setToken(response);
            this.appContext.userInformation$.next(response.user);
            this.authService.setRole(response?.user?.Tenant.length > 0 ? response?.user?.Tenant[0]?.Roles[0]?.name: 'CUSTOMER');

            if (this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')) {
              this.router.navigate([this.authService.redirectUrl || this.aRoute.snapshot.queryParamMap.get('redirectUrl')]);
              this.authService.redirectUrl = '';
            } else {
              this.router.navigate(['/app/home']);
            }
          }
        },
        (errResp) => {
          this.submitting = false;
          if(errResp?.status !== 423 && errResp?.status !== 419) {
            this.openSnackBar(errResp?.error?.error?.message);
          }

          if(errResp?.status === 419) {
            fd.status = 419;
            this.authService.signup$.next(fd);
            this.router.navigate(['/auth/verify-otp']);
          }

          if(errResp?.status === 423) {
            this.authService.signup$.next(fd);
            const activeDialog = this.dialog.open(ActivateEmailComponent, {
              data: {
                response: errResp?.error?.error?.message,
              },
              width: '408px',
              height: '320px',
            });
            activeDialog
              .afterClosed()
              .pipe(take(1))
              .subscribe((result) => {
                if(result) {
                  this.router.navigate(['/auth/verify-otp']);
                  this.sendOtp(fd.email);
                }
              });
          }
        }
      );
  }

  sendOtp(email: string) {
    this.http.post(`${environment.baseApiUrl}/auth/generateOTP`, {email: email, subject: 'Verification'})
    .subscribe((response: any) => {
      this.submitting = false;
    },
    errResp => {
      this.submitting = false;
      this.openSnackBar(errResp?.error?.message)
    });
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
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
}
