import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-sub-categories',
  templateUrl: './view-sub-categories.component.html',
  styleUrls: ['./view-sub-categories.component.scss']
})
export class ViewSubCategoriesComponent implements OnInit {
  container: any = {
    subCategoriesLoading: true
  };
  subCategoriesData: any;
  id: any;
  constructor(
    public dashboardService: IniDashboardService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
   this.id = this.activatedRoute.snapshot.paramMap.get('id');
   this.getSubCategories();
  }


  getSubCategories() {
    this.container['subCategoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category/${this.id}`)
      .subscribe(
        (response: any) => {
          this.container['category'] = response.category;
          this.subCategoriesData = response.data;
          this.container['subCategoriesLoading'] = false; },
        (errResp) => {
          this.container['subCategoriesLoading'] = false;
        }
      );
  }

}
