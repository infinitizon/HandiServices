import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController, } from '@ionic/angular';


// import { GMapService } from '@app/_shared/services/google-map.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

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
    private appContext: ApplicationContextService,
    // private gMapService: GMapService,
  ) {
    // this.gMapService.api.then((maps) => {
    //   this.getLocation(maps);
    //   this.container['loadedMaps'] = true;
    // });
  }

  ngOnInit() {
    this.getCategories();
    this.getRecommended();
    this.appContext.setCurrentCoord();

  }
  getLocation(maps: any) {
    this.appContext.location$
    .subscribe(coord=>{
      console.log(coord)
      // `https://maps.googleapis.com/maps/api/geocode/json?latlng=44.4647452,7.3553838&key=YOUR_API_KEY`
      // const geocoder = maps.Geocoder();
      // geocoder.geocode({location: maps.LatLng(coord.latitude, coord.longitude) },  (results: any, status: any)=>{
      //   console.log(coord, results, status);

      //   // if (status == google.maps.GeocoderStatus.OK) {
      //   //   this.container.address = this.gMapService.getAddresses(results?.find(a=>a.types.includes("street_address") && !a.plus_code)?.address_components);
      //   // }
      // })
    })
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
