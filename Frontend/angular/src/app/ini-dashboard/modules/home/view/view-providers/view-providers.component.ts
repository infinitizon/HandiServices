import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-providers',
  templateUrl: './view-providers.component.html',
  styleUrls: ['./view-providers.component.scss']
})
export class ViewProvidersComponent implements OnInit {

  container: any = {
    providersLoading: true
  };
  providersData: any;
  id: any;
  constructor(
    public dashboardService: IniDashboardService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
   this.id = this.activatedRoute.snapshot.paramMap.get('id');
   this.getProviders();
  }


  getProviders() {
   let coords: any = localStorage.getItem('coords');
   const coord = JSON.parse(coords);
    this.container['providersLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/${this.id}/tenants?lat=${coord?.lat}&lng=${coord?.lng}`)
      .subscribe(
        (response: any) => {
          this.providersData = response.data;
          this.container['providersLoading'] = false; },
        (errResp) => {
          this.container['providersLoading'] = false;
        }
      );
  }
  navigateToProviderXteristics(p: any) {
    this.router.navigate(['/app/home/view-checkout', p.id, this.id, 'characteristics'])
  }

}
