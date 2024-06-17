import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { InAppBrowser, InAppBrowserEvent } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-pmt-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class PMTCompleteComponent implements OnInit {
  @Input() data!: any;
  constructor(
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit(): void {
    const x=0;
  }
  onClose() {
    this.modalCtrl.dismiss()
  }
}
