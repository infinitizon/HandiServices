import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';

import { AlertController, IonModal, LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.page.html',
  styleUrls: ['./sub-category.page.scss'],
})
export class SubCategoryPage implements OnInit {


  selectedservice: any
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
    private alertCtrl: AlertController,
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
      .subscribe({
        next: (response: any) => {
          this.services = response.data;
          this.container['servicesLoading'] = false;
        },
        error: (errResp) => {
          this.container['servicesLoading'] = false;
        }
      });
  }
  onSelectService(data: any, modalSearch: IonModal) {
    this.selectedservice = data;
    this.alertCtrl.create({
      header: `Are you sure`,
      message: `This will add the ${data?.title} service to your list of services`,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
      },{
        text: 'Proceed',
        role: 'confirm',
        handler: () => this.addService(data),
      },]
    }).then(alertEl=>{
      alertEl.present();
    })
    modalSearch.dismiss();
  }
  addService(data: any) {
    if(!data.id) return;
    this.loadingCtrl.create({message: `Please wait...`})
        .then(loadingEl=>{
          loadingEl.present();
          this.http
            .post(`${environment.baseApiUrl}/admin/vendors/category`, {subCategories: [data?.id]})
            .subscribe({
              next: (response: any) => {
                loadingEl.dismiss();
                this.getSubCategories(this.categoryId)
                this.toastCtrl.create({message: `Service added successfully`, duration:3500, color: 'success'})
              },
              error: (err) => {
                loadingEl.dismiss();
                this.toastCtrl.create({message: err.error.message||`Error adding service`, duration:3500, color: 'danger', position: 'top'})
              }
            });
        })
  }
}
