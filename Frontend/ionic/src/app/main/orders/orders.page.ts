import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage {
  constructor(
    private navCtrl: NavController,
  ) { }
  ionViewWillEnter() {
    this.navCtrl.navigateForward('/main/sidebar/orders')
  }
}
