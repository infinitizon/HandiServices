import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { environment } from '@environments/environment';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  userSubscription$!: Subscription;
  userInformation: any;
  role: any;
  constructor(
    private http: HttpClient,
    private appContext: ApplicationContextService,
    private auth: AuthService,
  ) { }

  ngOnInit() { const x=0 }
  ionViewWillEnter() {

    this.appContext.getUserInformation()
                  .subscribe(user=>{
                    if(!user?.id) {
                      this.auth.isAuthenticated.pipe(take(1)).subscribe(auth=>{
                        if (auth) {
                          this.getUserInformation();
                        }
                      })
                    }
                  })

  }

  getUserInformation() {
    this.userSubscription$ = this.http
      .get(`${environment.baseApiUrl}/users`)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.userSubscription$.unsubscribe();
          this.appContext.userInformation$.next(response.data);
          if (response) {
            console.log(`this.userInformation => `, response);

            this.userInformation = response.data;
            this.role = this.userInformation?.Tenant[0].Roles[0].name;
            if (this.userInformation.firstLogin) {
            }
          }
        },
        error: (errResp) => {
          this.userSubscription$.unsubscribe();
        }
      });
  }
}
