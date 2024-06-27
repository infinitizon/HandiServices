import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  order: any;
  items!: any[];
  count = 0;

  container = {
    orderId: '',
    tenantId: '',
  }
  constructor(
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.aRoute.paramMap
        .subscribe(params=>{
          if(!params.has('orderId')) {
            this.navCtrl.navigateBack('/main/orders');
            return;
          }
          this.container.orderId = params.get('orderId') || '';
          this.container.tenantId = params.get('tenantId') || '';
          console.log(this.container.tenantId );

          this.getOrder(this.container.orderId, this.container.tenantId);
        })
  }

  getOrder(orderId: string, tenantId: string) {
    console.log(tenantId);

    this.http
        .get(`${environment.baseApiUrl}/users/cart?orderId=${orderId}${tenantId?'&tenantId='+tenantId:''}`)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            this.order = response.data.order;
            this.items = response.data.items;
            this.count = response.count;
          },
          error: (errResp) => {
            // this.container['paymentLoading'] = false;
          }
        });
  }
}
