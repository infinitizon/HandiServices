import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController, } from '@ionic/angular';


// import { GMapService } from '@app/_shared/services/google-map.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { StorageService } from '@app/_shared/services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  container: any = {
    categoriesLoading: true,
    role: ''
  };
  categoriesData: any;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private appContext: ApplicationContextService,
    private storageService: StorageService,
  ) {
  }

  ngOnInit() {
    this.getCategories();
    this.getRecommended();
    this.appContext.setCurrentCoord();
  }

  ionViewWillEnter() {
    console.log('Entering Home view');

    this.storageService.get('role').then(role=>{
      console.log(role);
      this.container.role = role;
    });
  }
  ionViewDidEnter() {
    console.log('Entered Home view');

    this.storageService.get('role').then(role=>{
      console.log(role);
      this.container.role = role;
    });
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
