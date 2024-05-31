import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-create',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent  implements OnInit {


  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log();

  }

  onBookPlace(role: string) {
    this.modalCtrl.dismiss(role=='close'?null:{message: "modal closed successfully"}, role)
  }

}
