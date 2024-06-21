import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '@app/_shared/services/storage.service';
import { SegmentChangeEventDetail } from '@ionic/angular';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: any
  container: any = {
    role: ''
  };
  constructor(
    private storageService: StorageService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    const x=0
  }

  ionViewWillEnter() {
    console.log('Entering Home view');

    this.storageService.get('role').then(role=>{
      console.log(role);
      this.container.role = role;
    });
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
        status = 'success,placed,pending'
    }
    this.getOrders(status);
  }
  getOrders(status: string) {
    this.http
        .get(`${environment.baseApiUrl}/users/orders?status=${status}`)
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
