import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { environment } from '@environments/environment';
import { ModalController, } from '@ionic/angular';

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
  ) {}

  ngOnInit() {
    this.getCategories();
    this.getRecommended();
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

}
