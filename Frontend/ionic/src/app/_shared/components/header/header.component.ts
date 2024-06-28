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
  currentLocation!: IAddress;
  location$ = new Subscription;
  container = {
    currentLocation: {},
  }
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private storageService: StorageService,
    private gMapService: GMapService,
    public appCtx: ApplicationContextService,
  ) {

    this.gMapService.api.then(async (maps) => {
      this.setCurrentLocation(maps);
    });
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
  setCurrentLocation(maps: Maps) {
    this.location$ = this.appCtx.location$
      .pipe(take(1))
        .subscribe(coord=>{
          let coords = coord.geometry;
          const geocoder = new maps.Geocoder();
          geocoder.geocode({location: {lat: coords?.lat ||0, lng: coords?.lng||0} },  (results, status)=>{
            if (status == maps.GeocoderStatus.OK) {
              this.currentLocation = this.gMapService.getAddresses(results?.find(a=>a.types.includes("street_address") && !a.plus_code)?.address_components);
              this.appCtx.location$.next({...coord, ...this.currentLocation })
              this.location$.unsubscribe()
            }
          })
        })
  }
}
