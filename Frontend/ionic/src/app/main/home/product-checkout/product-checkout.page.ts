import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { AlertController, NavController } from '@ionic/angular';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-product-checkout',
  templateUrl: './product-checkout.page.html',
  styleUrls: ['./product-checkout.page.scss'],
})
export class ProductCheckoutPage implements OnInit {

  priceForm!: FormGroup;
  errors: any = [];
  formErrors: any = {};
  uiErrors: any = this.formErrors;
  validationMessages: any = {}

  providerId: any;
  subCategoryId: any;
  activeAddress: any;
  providerXterData: any;

  container: any = {
    providersLoading: true,
    total: 0,
  };
  constructor(
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    public appCtx: ApplicationContextService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(paramMap => {
      this.providerId = paramMap.get('providerId');
      this.subCategoryId = paramMap.get('subCategoryId');
      this.appCtx.setCurrentCoord();
      this.getProviderXteristics();
    })
    this.appCtx.getUserInformation().subscribe(user=>{
      this.activeAddress = user?.Addresses?.find((u: any)=>u.isActive)
      console.log(this.activeAddress);
    })
  }

  getProviderXteristics() {
    this.http .get(`${environment.baseApiUrl}/products/tenant/${this.providerId}/${this.subCategoryId}/characteristics`)
     .subscribe({
         next: (response: any) => {
           this.providerXterData = response.data;

           const group: any = {};
           this.providerXterData.forEach((xter: any) => {
             group[xter?.id] = new FormControl(xter.value || null, Validators.required);
             this.validationMessages[xter?.id] = {'required': `${xter?.ProductCharacter?.name} is required`,}
             this.formErrors[xter?.id] = '';
           });
           this.priceForm = new FormGroup(group);
           this.calculatePrice();
           this.priceForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
         }, error: async (errResp) => {
           if(errResp.status === 402) {
            const alertEl = await this.alertCtrl.create({
              header: 'Login Required', message: errResp?.error?.error?.message,
              buttons: [{
                text: 'Ok', handler: ()=>{ this.navCtrl.navigateRoot('/main/home')}
              }]
            })
            await alertEl.present();
           }
         }
       });
   }
  decrement(p: any) {
    let value = +this.priceForm.get(p?.id)?.value
    value>0?value--:0
    this.priceForm.get(p?.id)?.patchValue(value);
  }
  increment(p: any) {
    let val = +this.priceForm.get(p?.id)?.value
    this.priceForm.get(p?.id)?.patchValue(val+1);
  }
  calculatePrice() {
    this.priceForm.valueChanges.subscribe(pf => {
      this.container['total'] = 0;
      Object.keys(pf).forEach((f:any)=>{
        const obj = this.providerXterData?.find((p:any)=>f==p?.id);
        // console.log(f, obj);

        this.container['total'] += (+pf[f] * obj?.ProductVendorCharacter?.price)
      })
    })
  }
  onSubmit() {
    this.container['submitting'] = true;
    this.priceForm.markAllAsTouched();
    if (this.priceForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.priceForm
      );
      this.commonService.displayErrors(this.formErrors, this.validationMessages, this.errors, this.uiErrors);
      return;
    }
    let payload = { orders: JSON.parse(JSON.stringify(this.priceForm.value))};

    this.http.post(`${environment.baseApiUrl}/users/cartify/${this.providerId}/${this.subCategoryId}`, payload)
      .subscribe({
        next: (response: any) => {
          this.navCtrl.navigateForward(`/main/home/cart`);
        },
        error: async (errResp) => {
          if(errResp.status === 402) {
            const alertEl = await this.alertCtrl.create({
              header: 'Login Required', message: errResp?.error?.error?.message,
              buttons: [{
                text: 'Ok', handler: ()=>{ this.navCtrl.navigateRoot('/main/home')}
              }]
            })
            await alertEl.present();
          }
        }
    });
  }
}
