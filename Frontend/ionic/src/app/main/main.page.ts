import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(
    private appCtx: ApplicationContextService,
  ) { }

  ngOnInit() { const x=0 }
  ionViewWillEnter() {
    this.appCtx.setUserInformation();
  }
}
