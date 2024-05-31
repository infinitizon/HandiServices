import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/_shared/services/auth.service';
import { environment } from '@environments/environment';


@Component({
  selector: 'in-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss']
})
export class LogoutDialogComponent implements OnInit {

  container = {};

  constructor(private auth: AuthService,
    public _dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    // this.auth.logout();
    this.container['submitting'] = true;
    this.http.post(`${environment.baseApiUrl}/auth/user/logout`, {},)
      .subscribe({
        next: (response: any) => {
          this.container['submitting'] = false
          this.auth.logout();
          this._dialogRef.close();
        },
        error: (errResp) => {
          this.container['submitting'] = false
          this._dialogRef.close();
        }
      });
  }
}
