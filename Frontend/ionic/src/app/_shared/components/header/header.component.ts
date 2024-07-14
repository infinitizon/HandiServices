import { Component, Input, OnInit } from '@angular/core';
import { IAddress } from '@app/_shared/models/address.interface';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { StorageService } from '@app/_shared/services/storage.service';
import { AlertController, NavController } from '@ionic/angular';
import { Subscription, from, take } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() role = '';
  @Input() currentLocation: IAddress = {};
  container = {
  }
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private storageService: StorageService,
    private gMapService: GMapService,
    public appCtx: ApplicationContextService,
  ) {

  }

  ionViewWillEnter() {
    console.log('Entering header view');

    // this.storageService.get('role').then(role=>{
    //   console.log(role);
    //   this.container.role = role;
    // });
  }
  async onOpenModal(type: string) {
    const token = await this.storageService.get('token');
    this.navCtrl.navigateForward('/main/sidebar')
  }
}
