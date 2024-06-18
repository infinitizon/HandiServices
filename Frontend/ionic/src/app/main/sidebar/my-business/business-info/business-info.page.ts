import { Component, OnInit, ViewChild } from '@angular/core';
import { FormErrors, ValidationMessages } from './business-info.validators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@app/_shared/services/common.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { IonInput, IonModal, LoadingController, ToastController } from '@ionic/angular';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { IAddress } from '@app/_shared/models/address.interface';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.page.html',
  styleUrls: ['./business-info.page.scss'],
})
export class BusinessInfoPage implements OnInit {

  @ViewChild('address', {read: IonInput}) address!: IonInput;

  enteredAddress!: IAddress;
  selectedCategory: any
  categorySearchOptions = {
    endpoint: `${environment.baseApiUrl}/products/category`,
    searchType: 'GET',
    title: 'Choose Category',
    key: 'id', label: 'title',
  }
  businesInfoForm!: FormGroup;
  businessInfo: any;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  container: any = {
    countdown: 20,
    saving: false,
  };
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private gMapService: GMapService,
    private commonService: CommonService,
    public appCtx: ApplicationContextService,
  ) {
    let interval = setInterval(()=>{
      this.container.countdown--
      if(this.container['loadedMaps']) {
        clearInterval(interval);
        this.container.countdown = -1;
      }
      if(this.container.countdown === 0) window.location.reload()
    }, 1000);
    this.gMapService.api.then(async (maps) => {
      this.container['loadedMaps'] = true;
      const input = await this.address?.getInputElement();

      this.initAutocomplete(maps, input);
      input.placeholder = 'Search and pick your address here...'
      // this.renderer.setProperty(this.address, 'placeholder', 'Search and pick your address here...');
    });
  }

  ngOnInit() {
    this.businesInfoForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.pattern(this.commonService.email)], ],
      userId: [null],
      category: [null, [Validators.required]],
      address: [null, [Validators.required]],
    });
    this.appCtx.getUserInformation()
      .subscribe({
        next: (data: any) => {
          if(data) {
            this.getBusinessInfo(data?.Tenant[0]?.id);
          }
        },
      });
  }
  getBusinessInfo(id: string) {
    this.loadingCtrl.create({message: `Please wait...`})
        .then(loadingEl=>{
          loadingEl.present();
          this.http.get(
            `${environment.baseApiUrl}/admin/vendor/${id}?includes=Media`
          ) .subscribe(
            (response: any) => {
              loadingEl.dismiss();
              this.businessInfo = response.data[0];
              console.log(this.businessInfo);
              let category = this.businessInfo?.Products.find((c: any)=>c.pId==null)
              let address = this.businessInfo?.Addresses.find((a: any)=>a.isActive)
              const addy = ((address?.houseNo??'') + ' '+address?.address1||'' + ' '+address?.address2||'')
              this.businesInfoForm.patchValue({
                id: this.businessInfo.id,
                name: this.businessInfo.name,
                email: this.businessInfo.email,
                category: category?.title,
                address: addy,
              })
            },
            (errRsp) => {
              loadingEl.dismiss();
            }
          );
        })
  }
  initAutocomplete(maps: Maps, input: any) {
    const autocomplete = new maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const  place  =  autocomplete.getPlace();
      this.enteredAddress= this.gMapService.getAddresses(place?.address_components);
      this.enteredAddress= {...this.enteredAddress, geometry: {lng: place?.geometry?.location?.lng(), lat: place?.geometry?.location?.lat()}}
    });
  }
  onSelectCategory(data: any, modalCategory: IonModal) {
    this.selectedCategory = data;
    this.businesInfoForm.patchValue({
      category: this.selectedCategory['title']
    });
    modalCategory.dismiss();
  }
  onUpdate() {
    this.businesInfoForm.markAllAsTouched();
    if (this.businesInfoForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.businesInfoForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    let fd = JSON.parse(JSON.stringify(this.businesInfoForm.value));
    const formData: FormData = new FormData();
    let changes = false;
    formData.append('fileType', 'tenant');
    for(let fd in this.businesInfoForm.value) {
      if(this.businesInfoForm.value[fd] != this.businessInfo[fd]) {
        formData.append(fd, this.businesInfoForm.value[fd]);
        (!['category', 'address'].includes(fd)) ? changes = true : 0;
      }
    }
    formData.delete('category');
    formData.delete('address');
    if(this.selectedCategory?.id) {
      formData.append('category', this.selectedCategory['id']);
      changes = true;
    }

    if((this.enteredAddress?.lat || this.enteredAddress?.lng) &&
      (this.businessInfo?.Addresses[0]?.lat != this.enteredAddress?.lat && this.businessInfo?.Addresses[0]?.lng != this.enteredAddress?.lng)) {
        changes = true;
        formData.append('Addresses', JSON.stringify(
          {
            id: this.businessInfo?.Addresses[0]?.id,
            no: this.enteredAddress?.number,
            address1: this.enteredAddress?.address1,
            address2: this.enteredAddress?.address2,
            city: this.enteredAddress?.city,
            lga: this.enteredAddress?.lga,
            state: this.enteredAddress?.state?.code,
            country: this.enteredAddress?.country?.code,
            lng: this.enteredAddress?.geometry?.lng,
            lat: this.enteredAddress?.geometry?.lat,
          },
        ));
    }
    if(!changes) {
      this.toastCtrl.create({message: `No changes detected`, duration: 3500, color: 'warning'})
          .then(toastEl=>{
            toastEl.present();
          })
          return;
    }
    this.loadingCtrl.create({message: `Please wait`})
        .then(loadingEl=>{
          loadingEl.present();
          this.http
            .patch(`${environment.baseApiUrl}/admin/vendor/${this.businessInfo.id}`, formData)
            .subscribe({
              next: async (response: any) => {
                loadingEl.dismiss();
                const toastEl = await this.toastCtrl.create({message: response?.message || `Record updated successfully`, duration:3500, color: 'success'})
                await toastEl.present();
                this.container.file = null
              },
              error: async (err) => {
                const toastEl = await this.toastCtrl.create({message: err?.error?.message  || `Error occured while updating record`, duration:3500, color: 'danger'})
                await toastEl.present();
                loadingEl.dismiss();
              }
            });

        })
  }
}
