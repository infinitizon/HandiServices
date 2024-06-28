import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '@app/_shared/services/storage.service';
import { NavController, SegmentChangeEventDetail } from '@ionic/angular';
import { environment } from '@environments/environment';
import { take } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage {
  orders: any
  container: any = {
    role: '',
    selectedTab: 'placed'
  };
  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private navCtrl: NavController,
  ) { }


  ionViewWillEnter() {
    this.storageService.get('role').then(role=>{
      this.container.role = role;
      this.getOrders('success,placed')
    });
  }
  goBackHome() {
    this.navCtrl.navigateBack('/main/home')
  }
  onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
    let status=''
    switch(event.detail.value) {
      case 'inprogress':
        status = 'inprogress';
        break;
      case 'cancelled':
        status = 'done,cancelled,completed';
        break;
      default:
        status = 'success,placed'
    }
    this.getOrders(status);
  }
  getOrders(status: string) {
    let url = this.container.role==='CUSTOMER' ? `${environment.baseApiUrl}/users/orders` :  `${environment.baseApiUrl}/admin/vendor/orders`;
    this.http
        .get(`${url}?status=${status}`)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            this.orders = response.data;
          },
          error: (errResp) => {
            // this.container['paymentLoading'] = false;
          }
        });
  }
}
