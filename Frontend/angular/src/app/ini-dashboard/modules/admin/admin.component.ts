import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(
    public dashboardService: IniDashboardService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
  });
  }

}
