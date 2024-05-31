import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  constructor(
    public dashboardService: IniDashboardService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
  });
  }

}
