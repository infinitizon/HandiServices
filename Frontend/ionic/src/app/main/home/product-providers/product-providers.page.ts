import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { NavController, ToastController } from '@ionic/angular';

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-product-providers',
  templateUrl: './product-providers.page.html',
  styleUrls: ['./product-providers.page.scss'],
})
export class ProductProvidersPage implements OnInit {
  container = {
    providersLoading: false,
  }
  productId = '';
  providersData!: any[]
  constructor(
    private aRoute: ActivatedRoute,
    private navCtrl: NavController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private commonServices: CommonService
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(paramMap=>{
      if(!paramMap.has('productId')) {
        this.navCtrl.navigateBack('/main/home');
        return;
      };
      this.productId = paramMap.get('productId')||'';

      if(!Capacitor.isPluginAvailable('Geolocation')) {
        return;
      }
      Geolocation.getCurrentPosition().then(coordinates=>{
        this.getProviders(this.productId, coordinates.coords)
      }).catch(error=>{
        this.toastCtrl.create({
          duration: 2000,
          message: `Ensure your location is on to use this service`,
          color: 'danger', position: 'top'
        }).then(toastEl=>toastEl.present())
      });
    })
  }

  getProviders(productId: string, coords: any) {
     this.container['providersLoading'] = true;
     this.http
       .get(`${environment.baseApiUrl}/products/${productId}/tenants?lat=${coords?.latitude}&lng=${coords?.longitude}`)
       .subscribe(
         (response: any) => {
           this.providersData = response.data;
           console.log(this.providersData);

           this.container['providersLoading'] = false; },
         (errResp) => {
           this.container['providersLoading'] = false;
         }
       );
   }
}
