import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { IonModal, LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.page.html',
  styleUrls: ['./sub-category.page.scss'],
})
export class SubCategoryPage implements OnInit {

  services!: any;
  categoryId!: string;
  container = {
    servicesLoading: false,
  }

  serviceSearchOptions = {
    endpoint: '',
    searchType: 'GET',
    title: 'Select your bank',
    key: 'id', label: 'title',
  }
  constructor(
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(params=>{
      this.categoryId = params.get('categoryId') || '';
      this.getSubCategories(this.categoryId);
      this.serviceSearchOptions.endpoint = `${environment.baseApiUrl}/products/category/${this.categoryId}`
    })
  }

  getSubCategories(categoryId: string) {
    this.container['servicesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/products/sub-category/${categoryId}`)
      .subscribe(
        (response: any) => {
          this.services = response.data;
          this.container['servicesLoading'] = false;
        },
        (errResp) => {
          this.container['servicesLoading'] = false;
        }
      );
  }
  onSelectService(event: any, modalSearch: IonModal) {

  }
}
