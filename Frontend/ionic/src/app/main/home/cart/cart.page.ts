import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PMTGatewayComponent } from '@app/_shared/components/payment/gateway/gateway.component';
import { IAddress } from '@app/_shared/models/address.interface';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { environment } from '@environments/environment';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {

  providerXterData: any = [];
  currentLocation: IAddress = {};
  existingAddress: IAddress = {};
  container = {
    cartsLoading: false,
    total: 0,
    currentLocation: {},
    useCurrentLoc: false,
  }
  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public appCtx: ApplicationContextService,
    private commonService: CommonService
  ) {
  }

  ionViewDidEnter() {
    console.log(`Entry to cart page`);

    this.appCtx.location$
        .pipe(take(2))
        .subscribe(location=>{
          if(location && location.address1) {
            this.currentLocation = location;
            return
          }
          this.appCtx.setCurrentLocation();
        })
    this.appCtx.getUserInformation()
        .pipe(take(1))
        .subscribe(async user=>{
          if(!user || ! user.id) {
            const toastEl = await this.toastCtrl.create({message: `You need to login to view cart`, duration: 3500, color: 'danger', position: 'top'});
            toastEl.present();
            this.navCtrl.navigateBack('/main/home'); return;
          }
          this.existingAddress = user.Addresses.find((a: any)=>a.isActive) || {}
          console.log(this.existingAddress);

          this.container.useCurrentLoc = Object.keys(this.existingAddress).length <= 0
          this.getCart()
        })
  }

  getCart() {
    this.container['cartsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/cart?status=pending`)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.container['cartsLoading'] = false;
          this.providerXterData = response.data['items'];
          this.providerXterData?.forEach((p: any)=>{
            this.container['total'] += (+p.value * p?.ProductVendorCharacter?.price)
          })
        },
        error: (errResp) => {
          this.container['cartsLoading'] = false;
        }
      });
  }
  async onCheckOut() {
    if(!this.container['total'] || this.container['total'] <= 0) return;
    let address = JSON.parse(JSON.stringify(this.container.useCurrentLoc ? this.currentLocation : this.existingAddress));
    address = {...address, country: address?.country?.code || address?.country, state: address?.state?.code || address?.state, }
    this.checkout({address});
  }

  async checkout(params: any) {
    const data = {
      useCurrentLoc: this.container.useCurrentLoc,
      address: {...params.address},
      type: 'debit',
      currency: 'NGN',
      amount: this.container['total'],
      module: 'order',
      description: `Payment for order ${this.providerXterData[0]?.orderId}`,
      redirectUrl: `https://ashy-moss-01c63ae03.4.azurestaticapps.net`,
      callbackParams: {
        module: 'order',
        assetId: this.providerXterData[0]?.orderId,
      },
      gatewayEndpoints: `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.providerXterData[0]?.orderId}`,
      post_url: `${environment.baseApiUrl}/users/checkout`,
    };
    const modalEl = await this.modalCtrl.create({
      component: PMTGatewayComponent,
      id: 'main-gateway',
      componentProps: {data},
      backdropDismiss: false,
      animated: true,
      keyboardClose: false,
      initialBreakpoint: 1,
      breakpoints: [1]
    });
    await modalEl.present();
    console.log('data came back from modal');
    let { data: result, role } = await modalEl.onDidDismiss();
    console.log(result, role);

    result = (result as URL)
    const complete = {
      success: (result.searchParams)?.get('success') == 'true' ? true : false,
      message: (result.searchParams)?.get('message') ?? ((result.searchParams)?.get('success') == 'true'?'Wallet top up succesfully': 'Error completing payment')
    }
    this.commonService.paymentComplete(complete, '/main/home/cart');
  }
  ionViewDidLeave() {
    this.container['total']=0;
    this.modalCtrl.dismiss()
  }
}
