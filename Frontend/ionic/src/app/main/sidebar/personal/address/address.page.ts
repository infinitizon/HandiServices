import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IAddress } from '@app/_shared/models/address.interface';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { IonModal, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  container: any = {
    addresses: [],
    workingAddress: {},
    modalTitle: null,
    settingDefault: false
  };
  userInformation!: any;

  constructor(
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.appContext.getUserInformation().subscribe({
      next: (data: any) => {
        this.userInformation = data;
        this.getAddress();
      },
    });
  }

  getAddress() {
    this.container['addressLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/users/address`)
      .subscribe({
        next: (response: any) => {
          this.container.addresses = response.data;
          if(this.container.addresses.length > 0) {
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
    a.settingDefault = true;
    this.http
      .patch(`${environment.baseApiUrl}/users/address/${a.id}`, fd)
      .subscribe({
        next: (response: any) => {
          a.settingDefault = false;
          this.getAddress();
        },
        error: (errResp) => {
          a.settingDefault = false;
          this.toastCtrl.create({
            message: errResp?.error?.error?.message,
            duration: 3500
          }).then(toastEl=>toastEl.present());
        }
      });
  }
  onDeleteAddress(a: any) {
    if(!a.id) return;
    a.settingDefault = true;
    this.http
      .delete(`${environment.baseApiUrl}/users/address/${a.id}`)
      .subscribe({
        next: (response: any) => {
          a.settingDefault = false;
          this.getAddress();
          this.toastCtrl.create({
            message: response.message||'Address deleted successfully',
            duration: 3500, color: 'success'
          }).then(toastEl=>toastEl.present());
        },
        error: (errResp) => {
          a.settingDefault = false;
          this.toastCtrl.create({
            message: errResp?.error?.error?.message,
            duration: 3500,
            color: 'danger'
          }).then(toastEl=>toastEl.present());
        }
      });
  }
}
