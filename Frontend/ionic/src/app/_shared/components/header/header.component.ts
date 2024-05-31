import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  constructor(
    private navCtrl: NavController,) { }

  ngOnInit() {
    console.log('');
  }

  onOpenModal(type: string) {
    this.navCtrl.navigateForward('/main/sidebar')
    // console.log(type);

    // this.modalCtrl.create({
    //   component: SidebarComponent,
    //   componentProps: {
    //     place: type
    //   }
    // }).then(modalEl =>{
    //   modalEl.present();
    //   return modalEl.onDidDismiss();
    // }).then(resultData => {
    //   console.log(resultData)
    // })
  }
}
