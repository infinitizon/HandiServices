import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { InAppBrowser, InAppBrowserEvent } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { of, switchMap, take } from 'rxjs';
import { PMTWebviewComponent } from '../webview/webview.component';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss']
})
export class PMTGatewayComponent implements OnInit {
  @Input() data: any;
  @Output() response = new EventEmitter<URL>();
  wallet: any
  container = {
    options: {
      header: {
        icon: '',
        title: ''
      },
      option: ''
    },
    partners: [],
    loadingPartners: false,
  }
  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private iab: InAppBrowser,
    private appCtx: ApplicationContextService,
  ) { }

  ngOnInit(): void {
    const x=0;
  }
  ionViewWillEnter(): void {
    this.appCtx.getWalletBalance()
      .pipe(
        take(1),
        switchMap(wallet=>{
          if(wallet) return of({data: wallet})
          else return this.http.get(`${environment.baseApiUrl}/users/wallet/fetch`)
        })
      ).subscribe(async (wallet: any)=>{
        this.wallet = wallet.data;
        this.appCtx.walletBalance$.next(wallet.data);
      })
    this.container.loadingPartners = true;
    this.http
      .get(this.data?.gatewayEndpoints ?? `${environment.baseApiUrl}/3rd-party-services/gateway?module=${this.data?.callbackParams?.module}&id=${this.data?.callbackParams?.assetId}`)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.container.loadingPartners = false;
          // this.container['cardLoading'] = false;
          this.container.partners = response.data
          // this.bankPayment = response.data.filter((card: any) => {
          //   return card.type === 'bank';
          // });
        },
        error: (err) => {
          this.container.loadingPartners = false;
        }
      });
  }
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  onOptionClick(option: string, modal: IonModal) {
    this.container.options.option = option;
    if(option==='partners') {
      this.container.options.header.icon = 'people-outline';
      this.container.options.header.title = 'Pay via our payment partners';
    }
    if(option==='cards') {
      this.container.options.header.icon = 'card-outline';
      this.container.options.header.title = 'Your saved cards';
    }
    modal.present()
  }
  onChoosePartner(partner: string, modal: IonModal) {
    let formData = { ...this.data, gateway: partner, };
    formData.callbackParams.gatewayId = formData.gatewayId;
    console.log(formData);

    this.loadingCtrl.create({
      message: `Please wait`,
    }).then(loadinEl => {
      loadinEl.present();
      this.http.post(this.data?.post_url ?? `${environment.baseApiUrl}/3rd-party-services/payment/initiate`, formData)
        .subscribe({
          next: (response: any) => {
            loadinEl.dismiss();
            this.completePmt(response.data.authorization_url, modal)
          },
          error: (err: any) => {
            loadinEl.dismiss();
            console.log(err);

              // this.commonServices.snackBar(errResp?.error?.error?.message || `Error saving request`, 'error');
          }
      });
    })
  }
  async completePmt(url: string, modal: IonModal) {

    // const modalEl = await this.modalCtrl.create({
    //   component: PMTWebviewComponent,
    //   id: 'main-gateway',
    //   componentProps: {data: {url}},
    //   backdropDismiss: false,
    //   animated: true,
    //   keyboardClose: false,
    // });
    // await modalEl.present();
    // let { data: result, role } = await modalEl.onDidDismiss();
    const browser = this.iab.create(url, '_blank', {
      hideurlbar: 'yes',
      hidenavigationbuttons: 'yes',
      toolbarcolor: '#ffffff',
      closebuttoncolor: '#ff0000'
    })
    browser.on('loadstart').subscribe((event: InAppBrowserEvent)=>{
      if (event && event.url && event.url.includes('success')) {
        browser.close();
        modal.dismiss()
        this.modalCtrl.dismiss(new URL(event.url), 'close', 'main-gateway');
        this.response.emit(new URL(event.url))
      }
    })
  }
}
