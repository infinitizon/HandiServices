import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage  {

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
    this.http
      .get(`${environment.baseApiUrl}/users/wallet/fetch`)
      .subscribe({
        next: (response: any) => {
          console.log(response);

          this.container.walletBalance = response.data;
          this.appCtx.walletBalance$.next(response.data);

          this.container['walletBalanceLoading'] = false;
        }, error: (errResp) => {
          this.container['walletBalanceLoading'] = false;
        }
      });

    // this.appCtx.getUserInformation()
    //   .pipe(
    //     switchMap((user: any)=>{
    //       console.log('Getting user infor', user);
    //       if(user) return of({data: user})
    //       else return this.http.get(`${environment.baseApiUrl}/users`)
    //     }),
    //     switchMap((user: any)=>{
    //       console.log(user);
    //       if(user) return of({data: user})
    //       else return this.http.get(`${environment.baseApiUrl}/users`)
    //     }),
    //   ).subscribe({
    //   next: (response: any) => {
    //     this.container.walletBalance = response.data;
    //     this.appCtx.walletBalance$.next(response.data);

    //     this.container['walletBalanceLoading'] = false;
    //   },error: (errResp) => {
    //     this.container['walletBalanceLoading'] = false;
    //   }
    // });
  }
}
