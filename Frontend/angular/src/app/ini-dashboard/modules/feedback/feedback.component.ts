import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  constructor(public dashboardService: IniDashboardService) {}

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
    });
  }
}
