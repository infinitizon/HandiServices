import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './business-info.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-view-business-info',
  templateUrl: './view-business-info.component.html',
  styleUrls: ['./view-business-info.component.scss'],
})
export class ViewBusinessInfoComponent implements OnInit {
  @Input() data = [];
  @ViewChild('search') searchElementRef: ElementRef = {
    nativeElement: undefined,
  };
  signupForm!: FormGroup;
  container: any = { countdown: 20 };
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  userInformation!: any;

  submitting = false;
  id: any;
  categories: any;
  constructor(
    private fb: FormBuilder,
    private gMapService: GMapService,
    private renderer: Renderer2,
    private commonServices: CommonService,
    private http: HttpClient,
    public appContext: ApplicationContextService
  ) {
    let interval = setInterval(() => {
      this.container.countdown--;
      if (this.container['loadedMaps']) {
        clearInterval(interval);
        this.container.countdown = null;
      }
      if (this.container.countdown === 0) window.location.reload();
    }, 1000);
    this.gMapService.api.then((maps) => {
      this.initAutocomplete(maps);
      this.container['loadedMaps'] = true;
      this.renderer.setProperty(
        this.searchElementRef.nativeElement,
        'placeholder',
        'Search and pick your address here...'
      ); if (this.data)  this.getLocation();
    });
  }

  ngOnInit() {
    let category = this.data[0]?.Products.find(c=>c.pId==null)
    this.getCategories();

    this.signupForm = this.fb.group({
      id: [this.data[0].id],
      name: [this.data[0].name, [Validators.required]],
      email: [
        this.data[0].email,
        [Validators.required, Validators.pattern(this.commonServices.email)],
      ],
      userId: [this.data[0]?.id],
      category: [category.id, [Validators.required]],
      address: ['', [Validators.required]],
    });
  }
  getLocation() {
    if (this.data) {
      let coords: any = {
        lat: this.data[0]?.Addresses[0]?.lat,
        lng: this.data[0]?.Addresses[0]?.lng,
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.container.address = this.gMapService.getAddresses(
            results?.find(
              (a) => a.types.includes('street_address') && !a.plus_code
            )?.address_components
          );
          this.signupForm.patchValue({
            address:this.container?.address?.number + " " + this.container?.address?.address1 + " " + this.container.address.city + " " + this.container?.address?.state?.name
          })
        }
      });
    }
  }

  fileChangeEvent(fileInput: any) {
    // this.imageError = null;
    this.container.image = fileInput.target.files[0];
    // this.uploadAvatar(fileInput.target.files[0]);
  }


  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/products/category`).subscribe(
      (response: any) => {
        this.categories = response.data;
        // this.total_count = response.data.length;
        this.container['categoriesLoading'] = false;
      },
      (errResp) => {
        this.container['categoriesLoading'] = false;
      }
    );
  }

  onSubmit() {
    this.submitting = true;
    if (this.signupForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.signupForm
      );
      this.displayErrors();
      this.submitting = false;
      return;
    }

    const formData: FormData = new FormData();
    formData.append('fileType', 'tenant');
    if(this.container.image) {
      formData.append('profile', this.container.image, this.container.image.name);
    }
    for(let fd in this.signupForm.value) {
      formData.append(fd, this.signupForm.value[fd]);
    }
    if(this.data[0]?.Addresses[0]?.lat != this.container?.address?.geometry?.lat && this.data[0]?.Addresses[0]?.lng != this.container?.address?.geometry?.lng) {
        formData.append('Addresses', JSON.stringify(
          {
            id: this.data[0]?.Addresses[0]?.id,
            no: this.container?.address?.number,
            address1: this.container?.address?.address1,
            address2: this.container?.address?.address2,
            city: this.container?.address?.city,
            lga: this.container?.address?.lga,
            state: this.container?.address?.state?.code,
            country: this.container?.address?.country?.code,
            lng: this.container?.address?.geometry?.lng,
            lat: this.container?.address?.geometry?.lat,
          },
        ));
    }

    this.http
      .patch(`${environment.baseApiUrl}/admin/vendor/${this.data[0].id}`, formData)
      .subscribe({
        next: (response: any) => {
          this.submitting = false;
          this.commonServices.snackBar(response?.message || `Record updated successfully`)
          this.container.file = null
        },
        error: (errResp) => {
          this.commonServices.snackBar(errResp?.message || `Error occured while updating record`, 'error')
          this.submitting = false;
        }
      });
  }

  initAutocomplete(maps: Maps) {
    const autocomplete = new maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.container.address = this.gMapService.getAddresses(
        place?.address_components
      );
      this.container.address = {
        ...this.container.address,
        geometry: {
          lng: place?.geometry?.location?.lng(),
          lat: place?.geometry?.location?.lat(),
        },
      };
    });
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.signupForm.get(ctrlName) as FormControl
    );
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control: any) => {
      Object.keys(this.errors[control]).forEach((error: any) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
    });
  }
}
