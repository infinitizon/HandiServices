import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { Subscription, of, switchMap, take } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { IAddress } from '@app/_shared/models/address.interface';
import { StorageService } from '@app/_shared/services/storage.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage  {

  currentLocation: IAddress = {};
  location$ = new Subscription;
  walletSubscription$ = new Subscription
  container: any = {
    walletBalanceLoading: false,
    walletBalance: 0,
    role: ''
  };
  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private appCtx: ApplicationContextService
  ) { }

  ionViewWillEnter() {
    this.getWalletBalance();
    this.appCtx.setUserInformation();
    this.appCtx.userRole$
      .subscribe(role=>{
        this.container.role = role
    })
    this.appCtx.location$
        .pipe(take(2))
        .subscribe(location=>{
          if(location && location.address1) {
            console.log(`Got location`, location);
            this.currentLocation = location;
            return
          }
          this.appCtx.setCurrentLocation();
        })
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
          }, error: async (err) => {
            this.container['walletBalanceLoading'] = false;
            const toastEl = await this.toastCtrl.create({ message: err?.error?.error?.message, duration: 3500, color: 'danger', position: 'top' })
            await toastEl.present();
          }
        });
  }
}
