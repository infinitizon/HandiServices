import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-view-business-info-container',
  templateUrl: './view-business-info-container.component.html'
})
export class ViewBusinessInfoContainerComponent implements OnInit {

  userInformation!: any;
  container: any = { countdown: 20 };
  businessInfo: any;

  constructor(
      public appContext: ApplicationContextService,
      private http: HttpClient,
      ) { }

  ngOnInit() {
    this.container['loading'] = true;
      this.appContext
      .getUserInformation()
      .subscribe({
        next: (data: any) => {
          if(data) {
            this.userInformation = data;
            this.getBusinessInfo(this.userInformation?.Tenant[0]?.id);
          }
        },
      });

  }


  getBusinessInfo(id: string) {
    this.http.get(
      `${environment.baseApiUrl}/admin/vendor/${id}?includes=Media`
    ) .subscribe(
      (response: any) => {
        this.businessInfo = response.data;
        this.container['loading'] = false;
      },
      (errRsp) => {
        this.container['loading'] = false;
      }
    );
  }

}
