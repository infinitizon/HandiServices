import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { AlertController, IonItemSliding, IonModal, LoadingController, ToastController } from '@ionic/angular';
import { FormErrors, ValidationMessages } from './pricing.validators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.page.html',
  styleUrls: ['./pricing.page.scss'],
})
export class PricingPage implements OnInit {

  selectedXter: any;
  pricings!: any;
  container = {
    categoryId: '',
    serviceId: '',
    pricingsLoading: false,
  }
  priceForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  xterSearchOptions = {
    endpoint: ``,
    searchType: 'GET',
    title: 'Select Type',
    key: 'id', label: 'name',
  }
  constructor(
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(params=>{
      this.container.serviceId = params.get('serviceId') || '';
      this.container.categoryId = params.get('categoryId') || '';
      this.getPricing(this.container.serviceId);
      this.xterSearchOptions.endpoint = `${environment.baseApiUrl}/admin/product/${this.container.categoryId}/xteristics`
    })
    this.priceForm = this.fb.group({
      characteristic: ['', [Validators.required],],
      price: [ '', [Validators.required], ],
    });
  }
  getPricing(serviceId: string) {
    this.container['pricingsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/vendors/product-price/${serviceId}`)
      .subscribe({
        next: (response: any) => {
          this.pricings = response.data;
          this.container['pricingsLoading'] = false;
        },
        error: (errResp) => {
          this.container['pricingsLoading'] = false;
        }
      });
  }

  onSelectXter(data: any, modalXter: IonModal) {
    this.selectedXter = data;
    console.log(this.selectedXter);

    this.priceForm.patchValue({
      characteristic: data['name'],
    });
    modalXter.dismiss();
  }
  onEditPrice(pricing: any, priceSliding: IonItemSliding, modalService: IonModal) {
    modalService.present();
    this.selectedXter = pricing.ProductCharacter;

    this.priceForm.patchValue({
      characteristic: pricing.ProductCharacter['name'],
      price: pricing.price
    });
    priceSliding.close()
  }
  onSubmitPriceForm() {
    this.priceForm.markAllAsTouched();
    if (this.priceForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.priceForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    let fd = JSON.parse(JSON.stringify(this.priceForm.value));
    fd.characteristic = this.selectedXter.id;

    const payload = {
      prices: [fd]
    }

    this.http.post(`${environment.baseApiUrl}/admin/vendors/product-price/${this.container.serviceId}`, payload)
      .subscribe({
        next: (response: any) => {
        },
        error: async (err: any) => {
          console.log(err);

          const toastEl = await this.toastCtrl.create({message: err?.error?.error?.message||`Error saving pricing`, duration: 3500, color: 'danger'})
          await toastEl.present();
      }
    });

  }
}
