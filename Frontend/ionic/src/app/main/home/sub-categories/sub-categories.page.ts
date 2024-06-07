import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.page.html',
  styleUrls: ['./sub-categories.page.scss'],
})
export class SubCategoriesPage implements OnInit {

  container = {
    subCategoriesLoading: false,
    category: {
      title: ''
    }
  };
  subCategoriesData: any
  categoryId = ''
  constructor(
    private aRoute: ActivatedRoute,
    private navCtrl: NavController,
    private http: HttpClient,
    private commonServices: CommonService
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(paramMap=>{
      console.log(paramMap.get('categoryId'))
      if(!paramMap.has('categoryId')) {
        this.navCtrl.navigateBack('/main/home');
        return;
      };
      this.categoryId = paramMap.get('categoryId')||''
      this.getSubCategories(this.categoryId)
    })
  }

  getSubCategories(categoryId: string) {
    this.container['subCategoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category/${categoryId}`)
      .subscribe({
        next: (response: any) => {
          this.container['category'] = response.category;
          const data = response.data?.map((v: any, i: number)=> v.index=i)
          this.subCategoriesData = this.commonServices.chunkArray(response.data, 3);
          console.log(this.subCategoriesData);

          this.container['subCategoriesLoading'] = false; },
        error: (errResp: any) => {
          this.container['subCategoriesLoading'] = false;
        }
      });
  }
  onSelectProduct(data: any) {
    if(!data.id) return;

    console.log(data);

    this.navCtrl.navigateForward(['/main/home/product-providers', data?.id])
  }
}
