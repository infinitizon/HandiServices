import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrors, ValidationMessages } from './fund.validators';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { ModalController } from '@ionic/angular';
import { PMTGatewayComponent } from '@app/_shared/components/payment/gateway/gateway.component';
import { Subscription, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-fund',
  templateUrl: './fund.page.html',
  styleUrls: ['./fund.page.scss'],
})
export class FundPage implements OnInit {

  walletSubscription$ = new Subscription
  walletForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private appCtx: ApplicationContextService,
    private commonService: CommonService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.walletForm = this.fb.group({
      amount: [null, [Validators.required]],
    })
    this.getWalletBalance();
  }

  getWalletBalance() {

  }

  onFundWallet() {
    this.walletForm.markAllAsTouched();
    if (this.walletForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.walletForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    let fd = JSON.parse(JSON.stringify(this.walletForm.value));
    const getUrl = window.location;
    this.walletSubscription$ = this.appCtx.getWalletBalance()
                .pipe(
                  switchMap(wallet=>{
                    if(wallet) return of({data: wallet})
                    else return this.http.get(`${environment.baseApiUrl}/users/wallet/fetch`)
                  })
                )
                .subscribe(async (response: any)=>{
                  const wallet = response.data
                  this.appCtx.walletBalance$.next(response.data);
                  this.walletSubscription$.unsubscribe()

                  const data = {
                    ...fd,
                    currency: 'NGN',
                    description: 'Wallet Deposit',
                    redirectUrl: `https://ashy-moss-01c63ae03.4.azurestaticapps.net`,
                    source: 'wallet',
                    type: 'credit',
                    callbackParams: {
                      module: 'wallet',
                      assetId: wallet?.assetId,
                    }
                  };
                  const modalEl = await this.modalCtrl.create({
                    component: PMTGatewayComponent,
                    id: 'main-gateway',
                    componentProps: {data},
                    backdropDismiss: false,
                    animated: true,
                    keyboardClose: false,
                    initialBreakpoint: 1,
                    breakpoints: [1]
                  });
                  await modalEl.present();
                  console.log('data came back from modal');
                  let { data: result, role } = await modalEl.onDidDismiss();
                  result = (result as URL)
                  const complete = {
                    success: (result.searchParams)?.get('success') == 'true' ? true : false,
                    message: (result.searchParams)?.get('message') ?? ((result.searchParams)?.get('success') == 'true'?'Wallet top up succesfully': 'Error completing payment')
                  }
                  // this.commonService.paymentComplete(complete, '/main/wallet');
                })

  }
}
