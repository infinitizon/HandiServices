import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { take } from 'rxjs';
@Component({
  selector: 'app-profile-select',
  templateUrl: './profile-select.component.html',
  styleUrls: ['./profile-select.component.scss']
})
export class ProfileSelectComponent implements OnInit {

  tab: string = '';
  user: any;
  submitting: boolean = false;
  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProfileSelectComponent>,
  ) {}

  ngOnInit() {
  }


  processToHome() {
    const fd = {
      userId: this.data?.users?.id,
      password:  this.data?.password,
      tenantId: this.user.id
    }
    this.submitting = true;
    this.http
      .post(`${environment.baseApiUrl}/auth/user/login-choose-tenant`, fd)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          this.authService.setToken(response);
          this.appContext.userInformation$.next(response.user);
          this.authService.setRole(response.user.Tenant[0]?.Roles[0].name);
          // this.appContext.userInformation = response.user;
            this.router.navigate(['/app/home']);
        },
        (errResp) => {
          this.submitting = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }

  tabChanged(tab: any) {
    this.tab = tab.name;
    this.user = tab;
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
