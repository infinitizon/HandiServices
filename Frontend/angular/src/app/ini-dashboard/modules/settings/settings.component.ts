import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(public dashboardService: IniDashboardService) {}

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
    });
  }
}
