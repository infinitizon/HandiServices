import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {

  categories!: any;
  container = {
    categoriesLoading: false,
  }
  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.loadingCtrl.create({
      message: `Loading your categories...`
    }).then(loadingEl => {
      loadingEl.present();
      this.container['categoriesLoading'] = true;
      this.http
        .get(`${environment.baseApiUrl}/admin/products/category`)
        .subscribe({
          next: async (response: any) => {
            this.categories = response.data;
            loadingEl.dismiss();
            this.container['categoriesLoading'] = false;
          },
          error: async (err) => {
            loadingEl.dismiss();
            const toastEl = await this.toastCtrl.create({ message: err.error.message||'Error fetching categories', duration:3500, color: 'danger', position: 'top'});
            toastEl.present();
            this.container['categoriesLoading'] = false;
          }
        });

    })
  }
  onCategoryDetail(category: any) {
    if(!category.id) return;
    this.navCtrl.navigateForward(['/main/sidebar/my-business/category', category.id])
  }
}
