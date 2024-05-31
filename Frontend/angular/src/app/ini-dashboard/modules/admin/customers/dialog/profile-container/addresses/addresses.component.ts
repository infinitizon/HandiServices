import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAddressComponent } from '@app/_shared/dialogs/add-address/add-address.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'd-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss'],
})
export class AddressesComponent implements OnInit {
  @Input('data') data: any

  container: any = {};
  userInformation!: any;
  addresses!: any;
  constructor(
    public appContext: ApplicationContextService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if(this.data) {
      this.container['role'] = this.data?.TenantUserRoles?.Role?.name;
      this.getAddress()
    } else {
      this.appContext.getUserInformation().subscribe({
        next: (data: any) => {
          this.userInformation = data;
          this.container['role'] = this.userInformation?.Tenant[0].Roles[0].name;
          this.getAddress();
        },
      });
    }
  }

  getAddress() {
    this.container['addressLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/users/address${this.data?('?userId='+this.data.id):''}`)
      .subscribe({
        next: (response: any) => {
          this.addresses = response.data;
          this.container['addressLoading'] = false;
        },
        error: (errResp) => {
          this.container['addressLoading'] = false;
        }
      });
  }

  addAddress(): void {
    const getUrl = window.location;
    const data = {};
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
}
