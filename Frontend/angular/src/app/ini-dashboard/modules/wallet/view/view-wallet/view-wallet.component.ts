import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GatewayDialogComponent } from '@app/_shared/dialogs/gateway-dialog/gateway-dialog.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-wallet',
  templateUrl: './view-wallet.component.html',
  styleUrls: ['./view-wallet.component.scss']
})
export class ViewWalletComponent implements OnInit {

  container: any = {
    walletBalanceLoading: true
  };
  walletBalance: any;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.getWalletBalance();
  }

  getWalletBalance() {
    this.container['walletBalanceLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/wallet/fetch`)
      .subscribe(
        (response: any) => {
          this.walletBalance = response.data;
          console.log(this.walletBalance);

          this.container['walletBalanceLoading'] = false;       },
        (errResp) => {
          this.container['walletBalanceLoading'] = false;
        }
      );
  }


  fundWallet(): void {
    const getUrl = window.location;
    const data = {
      currency: 'NGN',
      description: 'Wallet Deposit',
      redirectUrl: getUrl.protocol + "//" + getUrl.host + this.router.url,
      source: 'wallet',
      type: 'credit',
      callbackParams: {
        module: 'wallet',
        assetId: this.walletBalance.assetId,
      }
    }
    const gatewayDialog = this.dialog.open(GatewayDialogComponent, {
      data,
      minWidth: '30%',
      disableClose: false,
    });

    gatewayDialog.afterClosed().subscribe((response) => {
      if (response?.data?.authorization_url) {
        // callBack();
        window.location = response.data.authorizationUrl;
      }
    })
  }
}
