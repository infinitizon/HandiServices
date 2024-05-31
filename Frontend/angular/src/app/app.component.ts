import { Component } from '@angular/core';
import { AutoLogoutService } from './_shared/services/auto-logout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'home-services';
  constructor(private logout: AutoLogoutService) {
    localStorage.removeItem('session');
  }
}
