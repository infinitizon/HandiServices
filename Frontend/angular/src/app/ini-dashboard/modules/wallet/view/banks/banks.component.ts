import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {

  container: any = {}
  banks: any[] = [];

  constructor(
    private http: HttpClient,
    public appContext: ApplicationContextService,
  ) { }

  ngOnInit() {
    this.getBanks();
  }


  getBanks() {
    this.container['banksLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/beneficiary`)
      .subscribe(
        (response: any) => {
          this.banks = response.data;
          this.container['banksLoading'] = false;},
        (errResp) => {
          this.container['banksLoading'] = false;
        }
      );
  }

}
