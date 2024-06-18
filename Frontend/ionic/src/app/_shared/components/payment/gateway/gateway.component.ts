import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { InAppBrowser, InAppBrowserEvent } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

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
    }
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
      .subscribe(async (wallet: any)=>{
        this.wallet = wallet;
        console.log(this.wallet)
      })
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
            const browser = this.iab.create(response.data.authorization_url, '_blank', {
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
          },
          error: (err: any) => {
            loadinEl.dismiss();
            console.log(err);

              // this.commonServices.snackBar(errResp?.error?.error?.message || `Error saving request`, 'error');
          }
      });
    })
  }
}
