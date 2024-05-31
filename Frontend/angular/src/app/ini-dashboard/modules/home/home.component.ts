import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor(
    public dashboardService: IniDashboardService
  ) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = true;
  });
  }

}
