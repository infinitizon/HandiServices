import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/_shared/services/auth.service';
import { StorageService } from '@app/_shared/services/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.page.html',
  styleUrls: ['./sidebar.page.scss'],
})
export class SidebarPage implements OnInit {

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    const token = await this.storageService.get('token');
    if(!token) {
      this.navCtrl.navigateForward('/auth/login');
    }
  }

  onImagePicked(event: string |File) {
    console.log(event);
  }
  onLogout() {
    this.authService.logout();
  }
}
