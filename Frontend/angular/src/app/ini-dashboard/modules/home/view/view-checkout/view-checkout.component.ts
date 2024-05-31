import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageDialogComponent } from '@app/_shared/dialogs/message-dialog/message-dialog.component';
import { CommonService } from '@app/_shared/services/common.service';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';
import { environment } from '@environments/environment';
import { AuthService } from '@app/_shared/services/auth.service';
import { GMapService } from '@app/_shared/services/google-map.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-view-checkout',
  templateUrl: './view-checkout.component.html',
  styleUrls: ['./view-checkout.component.scss']
})
export class ViewCheckoutComponent implements OnInit {

  activeAddress: any;
  container: any = {
    providersLoading: true,
    total: 0,
  };
  providerXterData: any;
  providerId: any;
  subCategoryId: any;
  priceForm!: FormGroup;

  errors: any = [];
  formErrors: any = {};
  uiErrors: any = this.formErrors;
  validationMessages: any = {}

  constructor(
    private location: Location,
    public dashboardService: IniDashboardService,
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    public commonServices: CommonService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private gMapService: GMapService,
  ) {
    this.gMapService.api.then((maps) => {
      // this.initAutocomplete(maps);
      this.container['loadedMaps'] = true;
    });
  }

  ngOnInit() {
    this.aRoute.paramMap.subscribe(paramMap => {
      this.providerId = paramMap.get('id');
      this.subCategoryId = paramMap.get('subCategoryId');
      this.getProviderXteristics();
    })
    this.appContext.getUserInformation().subscribe(user=>{
      this.activeAddress = user?.Addresses?.find((u: any)=>u.isActive)
      console.log(this.activeAddress);
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

          const group: any = {};
          this.providerXterData.forEach((xter: any) => {
            group[xter?.id] = new FormControl(xter.value || null, Validators.required);
            this.validationMessages[xter?.id] = {'required': `${xter?.ProductCharacter?.name} is required`,}
            this.formErrors[xter?.id] = '';
          });
          this.priceForm = new FormGroup(group);
          this.priceForm.valueChanges.subscribe(pf => {
            this.container['total'] = 0;
            Object.keys(pf).forEach((f:any)=>{
              const obj = this.providerXterData?.find((pxd:any)=>f==pxd.id);
              this.container['total'] += (+pf[f] * obj.price)
            })
          })
          this.container['providersLoading'] = false;

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({location: coord },  (results, status)=>{
            console.log(coord, results, status);

            if (status == google.maps.GeocoderStatus.OK) {
              this.container.address = this.gMapService.getAddresses(results?.find(a=>a.types.includes("street_address") && !a.plus_code)?.address_components);
            }
          })
        }, (errResp) => {
          this.container['providersLoading'] = false;

          if(errResp.status === 402) {
            //
            const messageDialog = this.dialog.open(MessageDialogComponent, {
              data: {
                title: 'Login Required', message: errResp?.error?.error?.message,
                acceptButtonText: 'Proceed',cancelButtonText: 'Cancel',
              },
            });
            messageDialog.afterClosed().subscribe((result) => {
              if (result) {
                // localStorage.setItem('puchase', JSON.stringify({providerId: this.providerId, subCategoryId: this.subCategoryId, payload}))
                this.authService.redirectUrl = `/app/home/view-checkout/${this.providerId}/${this.subCategoryId}/characteristics`;
                this.router.navigateByUrl(`/auth/login?redirectUrl=/app/home/view-checkout/${this.providerId}/${this.subCategoryId}/characteristics`);
              } else {
                this.location.back();
              }
            });
          }
        }
      );
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
  onSubmit() {
    this.container['submitting'] = true;
    if (this.priceForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.priceForm
      );
      this.commonServices.displayErrors(this.formErrors, this.validationMessages, this.errors, this.uiErrors)
      this.container['submitting'] = false;
      return;
    }

    const addresses = this.activeAddress ? [this.activeAddress] : [{
      houseNo: this.container?.address?.number,
      address1: this.container?.address?.address1,
      address2: this.container?.address?.address2,
      city: this.container?.address?.city,
      lga: this.container?.address?.lga,
      state: this.container?.address?.state?.code,
      country: this.container?.address?.country?.code,
      lng: this.container?.address?.geometry?.lng,
      lat: this.container?.address?.geometry?.lat
    }]
    const payload =  {addresses, orders: this.priceForm.getRawValue()};

    this.http.post(`${environment.baseApiUrl}/users/cartify/${this.providerId}/${this.subCategoryId}`, payload)
      .subscribe({
        next: (response: any) => {
          this.container['submitting'] = false;
          this.router.navigateByUrl(`/app/home/cart`);

          this.commonServices.snackBar(response?.message);
        },
        error: (errResp: any) => {
          if(errResp.status === 402) {
            //
            const messageDialog = this.dialog.open(MessageDialogComponent, {
              data: {
                title: 'Login Required', message: errResp?.error?.error?.message,
                acceptButtonText: 'Proceed',cancelButtonText: 'Cancel',
              },
            });
            messageDialog.afterClosed().subscribe((result) => {
              if (result) {
                localStorage.setItem('puchase', JSON.stringify({providerId: this.providerId, subCategoryId: this.subCategoryId, payload}))
                this.authService.redirectUrl = `/app/home/view-checkout/${this.providerId}/${this.subCategoryId}/characteristics`;
                this.router.navigateByUrl(`/auth/login?redirectUrl=/app/home/view-checkout/${this.providerId}/${this.subCategoryId}/characteristics`);
              } else {
                this.location.back();
              }
            });
          } else {
            this.commonServices.snackBar(errResp?.error?.error?.message || `Error saving request`, 'error');
          }
        }
    });
  }
}
