import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { take } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  container = {};
  forgotPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private commonService: CommonService,
    ) { }

  ngOnInit() {

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.commonService.email)]]
    });

  }

  onSubmit() {
    const fd = JSON.parse(JSON.stringify(this.forgotPasswordForm.value));
    this.container['submitting'] = true;
    this.http
      .post(`${environment.baseApiUrl}/auth/forgot-password/otp`, fd)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.container['submitting'] = false;
          this.commonService.snackBar(response?.message);
          this.router.navigate(['/auth/reset-password',1]);
          this.authService.email$.next(fd);
        },
        error: (errResp) => {
          this.container['submitting'] = false;
          this.commonService.snackBar(errResp?.error?.error?.message, 'error');
        }
      });
  }
}
