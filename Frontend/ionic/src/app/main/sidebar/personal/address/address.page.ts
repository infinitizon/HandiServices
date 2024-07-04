import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IAddress } from '@app/_shared/models/address.interface';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { IonModal, LoadingController, NavController, ToastController } from '@ionic/angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  container: any = {
    selectedAddy: {},
    addresses: [],
    workingAddress: {},
    modalTitle: null,
    settingDefault: false,
    isCheckout: false
  };
  userInformation!: any;

  constructor(
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private aRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.router.url.includes('checkout')) {
      this.container.isCheckout = true;
    }
    this.appContext.getUserInformation()
        .pipe(take(1))
        .subscribe({
          next: (data: any) => {
            this.userInformation = data;
            this.getAddress();
          },
        });
  }

  getAddress() {
    this.container['addressLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/users/address`)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            this.container.addresses = response.data;
            if(this.container.addresses.length > 0) {
              this.container.selectedAddy = this.container.addresses[0]?.id
              this.container.addresses.forEach((address: any) => {
                address.state = {code: address.state, }
                address.country = {code: address.country, }
              });;
            }
            this.container['addressLoading'] = false;
          },
          error: (errResp) => {
            this.container['addressLoading'] = false;
          }
      });
  }
  onSelectAddress(value: any) {
    console.log(value);

  }
  onEditAddress(a: any, modalAddress: IonModal) {
    this.container.modalTitle = 'Edit Address'
    this.container.workingAddress = a;
    modalAddress.present();
  }
  onAddAddress(address: any, modalAddress: IonModal) {
    this.toastCtrl.create({
      color: address.color || 'success',
      message: address?.message || `Address Added successfully`,
      duration: 3500,
    }).then(toastEl=>{
      toastEl.present();
      this.container.modalTitle = null;
      this.container.workingAddress = {};
      this.getAddress();
      modalAddress.dismiss();
    })
  }

  onSetDefaultAddress(a: any) {
    if(!a.id) return;
    const fd = {
      isActive: true,
    };
    this.loadingCtrl.create({message: `Please wait`})
        .then(loadingEl=>{
          loadingEl.present();
          this.http
              .patch(`${environment.baseApiUrl}/users/address/${a.id}`, fd)
              .subscribe({
                next: async (response: any) => {
                  loadingEl.dismiss();
                  if(a.navigateToCart) {
                    const toastEl = await this.toastCtrl.create({ message: `Your default address was successfully saved`, duration: 3500, color: 'success'});
                    await toastEl.present();
                    this.navCtrl.navigateBack('/main/home/cart')
                  } else {
                    this.getAddress();
                  }
                },
                error: async (errResp) => {
                  loadingEl.dismiss();
                  const toastEl = await this.toastCtrl.create({ message: errResp?.error?.error?.message, duration: 3500, color: 'danger' });
                  await toastEl.present();
                }
              });
        })
  }
  onDeleteAddress(a: any) {
    if(!a.id) return;
    this.loadingCtrl.create({message: `Please wait`})
        .then(loadingEl=>{
          loadingEl.present();
          this.http
            .delete(`${environment.baseApiUrl}/users/address/${a.id}`)
            .subscribe({
              next: (response: any) => {
                loadingEl.dismiss();
                this.getAddress();
                this.toastCtrl.create({
                  message: response.message||'Address deleted successfully',
                  duration: 3500, color: 'success'
                }).then(toastEl=>toastEl.present());
              },
              error: async (errResp) => {
                loadingEl.dismiss();
                const toastEl = await this.toastCtrl.create({ message: errResp?.error?.error?.message, duration: 3500, color: 'danger', position: 'top' })
                await toastEl.present();
              }
            });
    })
  }
}
