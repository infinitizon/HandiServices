import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '@app/_shared/services/storage.service';
import { NavController, SegmentChangeEventDetail, ToastController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { of, switchMap, take } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage {
  orders: any
  loggedInUser: any;
  container: any = {
    role: '',
    selectedTab: 'placed'
  };
  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private socket: Socket,
    private appCtx: ApplicationContextService,
  ) { }


  ionViewWillEnter() {
    this.appCtx.getUserInformation()
        .pipe(
          take(1),
          switchMap((user: any)=>{
            if(!user) {
              return this.http.get(`${environment.baseApiUrl}/users`)
            }
            return of({data: user})
          }),
          take(1),
        )
        .subscribe({
          next: (user: any)=>{
          this.storageService.get('role').then(role=>{
            this.container.role = role;

            this.loggedInUser = role==='CUSTOMER'?user?.data : user?.data?.Tenant[0];

            this.socket.emit(`joinRoom`, { userId: this.loggedInUser?.id, sessionId: this.loggedInUser?.id })
            this.socket.connect();
            this.getOrders('success,placed')
          });
        }, error: async err=> {
          const toastEl = await this.toastCtrl.create({ message: err?.error?.error?.message, duration: 3500, color: 'danger', position: 'top' })
          await toastEl.present();

        }
      })

    this.socket.on(`getOnlineUsers`, (onlineUsers: any) =>{
      this.container.onlineUsers = onlineUsers;
    })
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
  isOnline(order: any) {
    console.log(this.loggedInUser.id, order?.id, this.container?.onlineUsers);

    if(this.container.role === 'CUSTOMER') {
      return this.container?.onlineUsers?.some((user: any)=>user?.userId===order?.id)
    }
    return this.container?.onlineUsers?.some((user: any)=> user?.userId===order.ProductVendorCharacters.OrderItems.Order.User.id)
    // return this.container?.onlineUsers?.some((user: any)=> [order.id, ].includes(user?.userId))
  }
  ionViewWillLeave() {
    this.socket.disconnect()
  }
}
