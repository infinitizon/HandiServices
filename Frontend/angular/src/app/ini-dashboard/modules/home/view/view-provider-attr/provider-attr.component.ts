import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-provider-attr',
  templateUrl: './provider-attr.component.html',
  styleUrls: ['./provider-attr.component.scss']
})
export class ViewProviderAttrComponent implements OnInit {

  container: any = {
    providersLoading: true
  };
  providerXterData: any;
  providerId: any;
  subCategoryId: any;

  // formErrors: any = FormErrors;
  // uiErrors: any = FormErrors;
  priceForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dashboardService: IniDashboardService,
    private http: HttpClient,
    private aRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(paramMap => {
      this.providerId = paramMap.get('id');
      this.subCategoryId = paramMap.get('subCategoryId');
      this.getProviderXteristics();
    })
  }


  getProviderXteristics() {
   let coords: any = localStorage.getItem('coords');
   const coord = JSON.parse(coords);
    this.container['providersLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/tenant/${this.providerId}/${this.subCategoryId}/characteristics`)
      .subscribe(
        (response: any) => {
          this.providerXterData = response.data;
          console.log(this.providerXterData);
          const group: any = {};

          this.providerXterData.forEach((xter: any) => {
            group[xter?.id] = new FormControl(xter.value || '', Validators.required)
          });
          this.priceForm = new FormGroup(group);
          this.container['providersLoading'] = false; },
        (errResp) => {
          this.container['providersLoading'] = false;
        }
      );
  }
  decrement(p: any) {
    let value = +this.priceForm.get(p?.id)?.value
    value>0?value--:0
    this.priceForm.get(p?.id)?.patchValue(value);
    this.priceForm.get(p?.id)?.updateValueAndValidity();
  }
  increment(p: any) {
    let val = +this.priceForm.get(p?.id)?.value
    this.priceForm.get(p?.id)?.patchValue(val+1);
    this.priceForm.get(p?.id)?.updateValueAndValidity();

  }
  onSubmit() {
    this.container['submitting'] = true;
    // if (this.priceForm.invalid) {
    //   this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
    //   this.errors = this.commonService.findInvalidControlsRecursive(
    //     this.categoryForm
    //   );
    //   this.displayErrors();
    //   this.container['submitting'] = false;
    //   return;
    // }
    const payLoad = JSON.stringify(this.priceForm.getRawValue());
    console.log(payLoad);
  }
}
