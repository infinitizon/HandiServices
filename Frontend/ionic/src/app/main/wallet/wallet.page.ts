import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { Subscription, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage  {

  walletSubscription$ = new Subscription
  container: any = {
    walletBalanceLoading: false,
    walletBalance: 0
  };
  constructor(
    private http: HttpClient,
    private appCtx: ApplicationContextService
  ) { }

  ionViewWillEnter() {
    this.getWalletBalance();
  }

  getWalletBalance() {
    this.container['walletBalanceLoading'] = true;
    this.walletSubscription$ = this.appCtx.getWalletBalance()
        .pipe(
          take(1),
          switchMap(wallet=>{
            if(wallet) return of({data: wallet})
            else return this.http.get(`${environment.baseApiUrl}/users/wallet/fetch`)
          })
        ).subscribe({
          next: (response: any) => {
            console.log(response);

            this.container.walletBalance = response.data;
            this.appCtx.walletBalance$.next(response.data);

            this.container['walletBalanceLoading'] = false;
          }, error: (errResp) => {
            this.container['walletBalanceLoading'] = false;
          }
        });
  }
}
