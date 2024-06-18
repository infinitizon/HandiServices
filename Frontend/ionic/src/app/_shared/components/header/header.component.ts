import { Component, OnInit } from '@angular/core';
import { StorageService } from '@app/_shared/services/storage.service';
import { AlertController, NavController } from '@ionic/angular';
import { from, take } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    console.log('');
  }

  async onOpenModal(type: string) {
    const token = await this.storageService.get('token');
    console.log(token);

    // if(!token) {
    //   const alert = await this.alertCtrl.create({
    //     header: 'Login required',
    //     subHeader: 'You need to login to see profile',
    //     // message: 'A message should be a short, complete sentence.',
    //     buttons: [{
    //       text: 'Login',
    //       handler: () => {
    //         return this.navCtrl.navigateForward('/auth/login')
    //       }
    //     }],
    //   });
    //   return alert.present();
    // }
    return this.navCtrl.navigateForward('/main/sidebar')
  }
}
