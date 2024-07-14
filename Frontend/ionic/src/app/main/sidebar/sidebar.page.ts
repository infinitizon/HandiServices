import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { StorageService } from '@app/_shared/services/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.page.html',
  styleUrls: ['./sidebar.page.scss'],
})
export class SidebarPage {

  container = {
    token: false,
    role: ''
  }
  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private storageService: StorageService,
    private appCtx: ApplicationContextService,
  ) { }

  async ionViewWillEnter() {
    this.appCtx.userRole$
      .subscribe(role=>{
        this.container.role = role
    })
    const token = await this.storageService.get('token');
    if(token) {
      this.container.token = true
      // this.navCtrl.navigateForward('/auth/login');
    }
  }

  onImagePicked(event: string |File) {
    console.log(event);
  }
  onLogout() {
    this.authService.logout();
  }
  onLogin() {
    this.navCtrl.navigateForward('/auth/login')
  }
  async onSignup(vendor: boolean) {
    if(vendor) await this.storageService.set('vendor', true);
    this.navCtrl.navigateForward('/auth/signup')
  }
}
