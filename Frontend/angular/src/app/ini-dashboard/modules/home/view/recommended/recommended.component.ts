import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';
import { ViewRecommendedDetailComponent } from '../view-recommended-detail/view-recommended-detail.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss']
})
export class RecommendedComponent implements OnInit {

  container: any = {
    providersLoading: true
  };
  providersData: any;
  id: any;
  constructor(
    public dashboardService: IniDashboardService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
   this.id = this.activatedRoute.snapshot.paramMap.get('id');
   this.getRecommended();
  }


  getRecommended() {
    this.container['recommendedLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/vendors/recommend`)
      .subscribe({
        next: (response: any) => {
          this.container['recommended'] = response.data?.filter(r=>r.Products?.find(p=>p.pId));
          this.container['recommendedLoading'] = false;
        },
        error: (errResp) => {
          this.container['recommendedLoading'] = false;
        }
      });
  }

  onViewProviderDetails(provider: any) {
    this.container['providerServicesLoading'] = true;
    const categoryDialog = this.dialog.open(ViewRecommendedDetailComponent, {
      data: provider,
      minWidth: '30%',
      disableClose: false,
    });

    categoryDialog.afterClosed().subscribe((response) => {
      this.container['category'] = [];
    })

  }
}
