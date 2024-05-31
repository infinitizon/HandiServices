import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.scss']
})
export class ViewCategoriesComponent implements OnInit {
  container: any = {
    categoriesLoading: true
  };
  categoriesData: any;

  constructor(
    public dashboardService: IniDashboardService,
    private http: HttpClient
  ) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
  });

  this.getCategories();
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
        (response: any) => {
          this.categoriesData = response;
          this.container['categoriesLoading'] = false; },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }
}
