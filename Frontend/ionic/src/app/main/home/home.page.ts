import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import { environment } from '@environments/environment';
import { ModalController, NavController, ToastController, } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  container: any = {
    categoriesLoading: true
  };
  categoriesData: any;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.getCategories();
    this.getRecommended();

    if(!Capacitor.isPluginAvailable('Geolocation')) {
      return;
    }
    Geolocation.getCurrentPosition().then(coordinates=>{
      console.log('Current position:', coordinates);
    }).catch(error=>{
      this.toastCtrl.create({
        duration: 2000,
        message: `Could not locate your position`,
        color: 'danger'
      }).then(toastEl=>toastEl.present())

    });
  }
  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
        (response: any) => {
          this.categoriesData = response.data;
          this.container['categoriesLoading'] = false;       },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }
  getRecommended() {
    this.container['recommendedLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/vendors/recommend`)
      .subscribe(
        (response: any) => {
          this.container['recommended'] =  response.data?.filter((r:any)=>r.Products?.find((p:any)=>p.pId));
          this.container['recommendedLoading'] = false;       },
        (errResp) => {
          this.container['recommendedLoading'] = false;
        }
      );
  }
  onCategoryClick(c: any) {
    this.navCtrl.navigateForward(`/main/home/category/${c?.id}`);
  }
}
