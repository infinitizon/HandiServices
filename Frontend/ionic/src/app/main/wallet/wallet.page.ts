import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  container: any = {
    walletBalanceLoading: false,
    walletBalance: 0
  };
  constructor(
    private http: HttpClient,
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
          this.container.walletBalance = response.data;
          console.log(this.container.walletBalance);

          this.container['walletBalanceLoading'] = false;       },
        (errResp) => {
          this.container['walletBalanceLoading'] = false;
        }
      );
  }
}
