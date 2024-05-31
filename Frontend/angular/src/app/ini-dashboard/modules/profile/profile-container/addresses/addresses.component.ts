import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { AddAddressComponent } from '@app/_shared/dialogs/add-address/add-address.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss'],
})
export class AddressesComponent implements OnInit {
  container: any = {};
  userInformation!: any;
  addresses!: any;
  submitting: boolean = false;
  constructor(
    public appContext: ApplicationContextService,
    private dialog: MatDialog,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.appContext.getUserInformation().subscribe({
      next: (data: any) => {
        this.userInformation = data;
        this.getAddress();
      },
    });
  }

  getAddress() {
    this.container['addressLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/users/address`).subscribe(
      (response: any) => {
        this.addresses = response.data;
        this.container['addressLoading'] = false;
      },
      (errResp) => {
        this.container['addressLoading'] = false;
      }
    );
  }

  addAddress(): void {
    const getUrl = window.location;
    const data = null;
    const addressDialog = this.dialog.open(AddAddressComponent, {
      data,
      minWidth: '30%',
      disableClose: false,
    });

    addressDialog.afterClosed().subscribe((response) => {
      this.getAddress();
    });
  }

  editAddress(element: any): void {
    const getUrl = window.location;
    const addressDialog = this.dialog.open(AddAddressComponent, {
      data: element,
      minWidth: '30%',
      disableClose: false,
    });

    addressDialog.afterClosed().subscribe((response) => {
      this.getAddress();
    });
  }

  setDefaultAddress(id: string) {
    const fd = {
      isActive: true,
    };
    this.submitting = true;
    this.http
      .patch(`${environment.baseApiUrl}/users/address/${id}`, fd)
      .subscribe(
        (response: any) => {
          this.submitting = false;
          //  this.authService.email$.next(fd.email);
          this.successSnackBar('Address set successfully');
          this.getAddress();
        },
        (errResp) => {
          this.submitting = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
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
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['success'],
    });
  }
}
