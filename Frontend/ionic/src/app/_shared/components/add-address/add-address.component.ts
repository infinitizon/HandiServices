import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { FormErrors, ValidationMessages } from './add-address.validators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { IAddress } from '@app/_shared/models/address.interface';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss'],
})
export class AddAddressComponent  implements OnInit {
  @Input() data!: IAddress;
  @ViewChild('address', {read: IonInput}) address!: IonInput;
  @Output() added = new EventEmitter<any>();

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  addressForm!: FormGroup;

  enteredAddress!: IAddress
  container: any = {
    countdown: 20,
    saving: false,
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private gMapService: GMapService,
    private commonService: CommonService,
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
    this.enteredAddress = this.data
    this.enteredAddress.houseNo = this.data?.houseNo;
    const address = ((this.data?.houseNo??'') + ' ' + (this.data?.address1??'') + ' ' + (this.data?.address2??''))?.trim();
    this.addressForm = this.fb.group({
      isDefault: [this.data?.isActive||true],
      firstName: [this.data?.firstName, [Validators.required]],
      lastName: [this.data?.lastName, [Validators.required]],
      phone: [this.data?.phone, [Validators.required]],
      address: [address||null, [Validators.required]],
    });
  }

  initAutocomplete(maps: Maps, input: any) {
    const autocomplete = new maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const  place  =  autocomplete.getPlace();
      this.enteredAddress= this.gMapService.getAddresses(place?.address_components);
      this.enteredAddress= {...this.enteredAddress, geometry: {lng: place?.geometry?.location?.lng(), lat: place?.geometry?.location?.lat()}}
    });
  }
  onSubmitVendor() {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.addressForm
      );
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    let fd = JSON.parse(JSON.stringify(this.addressForm.value));
    (this.enteredAddress?.number && this.data?.houseNo != this.enteredAddress?.number) ? (fd.houseNo = this.enteredAddress?.number) : 0;
    this.data?.firstName != this.enteredAddress?.firstName ?(fd.firstName = this.enteredAddress?.firstName) : 0;
    this.data?.lastName != this.enteredAddress?.lastName ?(fd.lastName = this.enteredAddress?.lastName) : 0;
    this.data?.address1 != this.enteredAddress?.address1 ?(fd.address1 = this.enteredAddress?.address1) : 0;
    this.data?.address2 != this.enteredAddress?.address2 ?(fd.address2 = this.enteredAddress?.address2) : 0;
    this.data?.city != this.enteredAddress?.city ?(fd.city = this.enteredAddress?.city) : 0;
    this.data?.lga != this.enteredAddress?.lga ?(fd.lga = this.enteredAddress?.lga) : 0;
    this.data.state?.code != this.enteredAddress?.state?.code ?(fd.state = this.enteredAddress?.state?.code) : 0;
    this.data?.country?.code != this.enteredAddress?.country?.code ?(fd.country = this.enteredAddress?.country?.code) : 0;
    this.data?.geometry?.lng != this.enteredAddress?.geometry?.lng ?(fd.lng = this.enteredAddress?.geometry?.lng) : 0;
    this.data?.geometry?.lat != this.enteredAddress?.geometry?.lat ?(fd.lat = this.enteredAddress?.geometry?.lat) : 0;
    this.data?.isActive == fd?.isDefault ? delete fd?.isDefault : 0;
    this.data?.phone != fd?.phone?.replace(' ', '') ? (fd.phone = fd?.phone.replace(' ', '')) : delete fd.phone,
    delete fd.address;

    this.container.saving = true;
    if(Object.keys(fd).length > 0){
      (this.data?.id ? this.http.patch(`${environment.baseApiUrl}/users/address/${this.data?.id}`, fd) : this.http.post(`${environment.baseApiUrl}/users/address`, fd))
        .subscribe({
          next: (response: any) => {
            this.container.saving = false;
            this.added.emit({...response, color: 'success'});
          },
          error: (errResp: any) => {
            this.container.saving = false;
          }
        });
    } else {
      this.container.saving = false;
      this.added.emit({
        success: true,
        color: 'warning',
        message: `No changes detected`
      });
    }
  }
}
