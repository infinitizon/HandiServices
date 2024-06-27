import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { InAppBrowser, InAppBrowserEvent } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { fromEvent, skip } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pmt-webview',
  templateUrl: './webview.component.html',
  styleUrls: ['./webview.component.scss']
})
export class PMTWebviewComponent implements OnInit {
  @Input() data!: any;
  webViewUrl!: SafeResourceUrl;
  @ViewChild('iframe') iframe!: ElementRef;
  constructor(
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.loadWebView();
  }
  ngAfterViewInit(): void {
    console.log(this.iframe);
    // fromEvent(this.iframe.nativeElement, 'load')
    //   .subscribe({
    //     next: (event: any) => {
    //       console.log('event=>', event);
    //       console.log('event.target=>', event.target);
    //       console.log('event.target.contentWindow', event.target.contentWindow);
    //       console.log('event.target.contentWindow.location', event.target.contentWindow.location);
    //       console.log('this.iframe.nativeElement.contentWindow.location', this.iframe.nativeElement.contentWindow.location);
    //       // console.log('this.iframe.nativeElement.contentWindow.location.href', this.iframe.nativeElement.contentWindow.location.href);
    //       console.log('event.target.contentWindow.document', event.target.contentWindow.document);
    //     },
    //     error: (err)=>{
    //       console.log(err);
    //     }
    //   });
    fromEvent(this.iframe.nativeElement, 'message')
      .subscribe({
        next: (event: any) => {
          console.log(event);
        },
        error: (err)=>{
          console.log(err);
        }
      });
  }
  changed(event: any) {
    console.log('event=>', event);
    console.log('event.target=>', event.target);
    console.log('event.target.src=>', event.target.src);
    console.log('event.target.contentWindow', event.target.contentWindow);
    console.log('event.target.contentWindow.location', event.target.contentWindow.location);
    console.log('event.target.contentWindow.location.href', event.target.contentWindow.location.href);
    // console.log('this.iframe.nativeElement.contentWindow.location.href', this.iframe.nativeElement.contentWindow.location.href);
  }
  loadWebView() {
      // const content = this.data.url;
      // const blob = new Blob([content], { type: 'text/html' });
      // const url = URL.createObjectURL(blob);
      this.webViewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
      // this.iframe.nativeElement.
      // this.webViewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      // this.webViewUrl = this.data.url;
  }
  onClose() {
    this.modalCtrl.dismiss()
  }
}
