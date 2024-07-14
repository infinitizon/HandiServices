import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController, } from '@ionic/angular';
import { Subscription, take } from 'rxjs';


// import { GMapService } from '@app/_shared/services/google-map.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { StorageService } from '@app/_shared/services/storage.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { IAddress } from '@app/_shared/models/address.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  currentLocation: IAddress = {};
  location$ = new Subscription;
  container: any = {
    categoriesLoading: true,
    role: ''
  };
  categoriesData: any;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private appCtx: ApplicationContextService,
  ) {
  }

  ngOnInit() {
    this.getCategories();
    this.getRecommended();
  }

  ionViewWillEnter() {
    console.log(`Ion view will enter`);

    this.appCtx.setUserInformation();
    this.appCtx.userRole$
      .subscribe(role=>{
        this.container.role = role
    })
    this.appCtx.location$
        .pipe(take(2))
        .subscribe(location=>{
          if(location && location.address1) {
            this.currentLocation = location;
            return
          }
          this.appCtx.setCurrentLocation();
        })
  }
  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe({
        next: (response: any) => {
          this.categoriesData = response.data;
          this.container['categoriesLoading'] = false;       },
        error: (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      });
  }
  getRecommended() {
    this.container['recommendedLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/vendors/recommend`)
      .subscribe({
        next: (response: any) => {
          this.container['recommended'] =  response.data?.filter((r:any)=>r.Products?.find((p:any)=>p.pId));
          this.container['recommendedLoading'] = false;       },
        error: (errResp) => {
          this.container['recommendedLoading'] = false;
        }
      });
  }
  onCategoryClick(c: any) {
    this.navCtrl.navigateForward(`/main/home/category/${c?.id}`);
  }
}
