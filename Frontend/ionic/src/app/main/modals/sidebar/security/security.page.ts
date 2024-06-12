import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage {
  container = {
    setting2fa: false,
    twoFA: false,
  }
  constructor(
    private appCtx: ApplicationContextService,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
  ) { }

  ionViewWillEnter() {
    this.appCtx.getUserInformation()
              .subscribe(val=>{
                this.container.twoFA=val.twoFactorAuth
              })
  }

  async on2fa(event: any) {
    const loadingEl = await this.loadingCtrl.create({
      message: `Please wait...`
    });
    loadingEl.present();
    this.http
      .patch(`${environment.baseApiUrl}/users/profile/update`, {twoFactorAuth: event.detail.checked})
      .subscribe({
        next: async (response: any) => {
          await loadingEl.dismiss();
          this.container['twoFA'] = event.detail.checked;
          this.appCtx.userInformation$.next(response.data);
        },
        error: async (errResp) => {
          await loadingEl.dismiss();
          console.log(errResp);
        }
      });
  }
}
