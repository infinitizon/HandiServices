import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {

  constructor(
    public dashboardService: IniDashboardService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
  });
  }

}
