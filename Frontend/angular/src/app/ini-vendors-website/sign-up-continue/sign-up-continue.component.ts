import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './sign-up.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { Crypto } from '@app/_shared/classes/Crypto';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { GMapService, Maps } from '@app/_shared/services/google-map.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-sign-up-continue',
  templateUrl: './sign-up-continue.component.html',
  styleUrls: ['./sign-up-continue.component.scss'],
})
export class SignUpContinueComponent implements OnInit {
  @ViewChild('search') searchElementRef:  ElementRef = {
    nativeElement: undefined
  };
  signupForm!: FormGroup;
  container: any = {
    countdown: 20,
    gettingUser: true,
  };
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;


  submitting = false;
  categories: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gMapService: GMapService,
    private renderer: Renderer2,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private aRoute: ActivatedRoute,
    public appContext: ApplicationContextService,
    ) {
      let interval = setInterval(()=>{
        this.container.countdown--
        if(this.container['loadedMaps']) {
          clearInterval(interval);
          this.container.countdown = null
        }
        if(this.container.countdown === 0) window.location.reload()
      }, 1000)
      this.gMapService.api.then((maps) => {
        this.initAutocomplete(maps);
        this.container['loadedMaps'] = true;
        this.renderer.setProperty(this.searchElementRef.nativeElement, 'placeholder', 'Search and pick your address here...');
      });
    }

  ngOnInit() {
    this.container.gettingUser = true;
    this.aRoute.paramMap.pipe(
      switchMap(params=>{
        return this.http.get(`${environment.baseApiUrl}/users/vendor/user/${params.get('id')}`)
      })
    ).subscribe({
      next: (user: any)=>{
        if(!user.data) {
          this.router.navigate(['/vendors-onboarding/signup']);
          this.commonServices.snackBar(`There is no user attached to this account. Please register or contact admin`, 'error');
          return;
        }
        this.container.user = user.data
        this.signupForm = this.fb.group(
            {
              name: ['', [Validators.required]],
              email: ['', [Validators.required, Validators.pattern(this.commonServices.email)]],
              userId: [user?.data?.id],
              category: ['', [Validators.required]],
              address: ['', [Validators.required]],
            }
        )
        this.container.gettingUser = false;
      }
    })
    this.getCategories();
  }

  getRegisteredUser
  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
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
       this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
       this.errors = this.commonServices.findInvalidControlsRecursive(this.signupForm);
       this.displayErrors();
       this.submitting = false;
       return;
     }

     const fd = JSON.parse(JSON.stringify(
       this.signupForm.value
     ));
     fd.Addresses = [{
        no: this.container?.address?.number,
        address1: this.container?.address?.address1,
        address2: this.container?.address?.address2,
        city: this.container?.address?.city,
        lga: this.container?.address?.lga,
        state: this.container?.address?.state?.code,
        country: this.container?.address?.country?.code,
        lng: this.container?.address?.geometry?.lng,
        lat: this.container?.address?.geometry?.lat,
     }];
     delete fd.address;
    //  console.log(fd); return


     this.http.post(`${environment.baseApiUrl}/auth/tenant/complete`, fd,)
       .subscribe({
          next: (response: any) => {
            this.submitting = false;
            this.authService.signup$.next({email: fd.email});
            this.commonServices.snackBar("Business Signup successful");
            this.router.navigate(['/vendors-onboarding/verify-otp']);
          },
          error: errResp => {
            this.submitting = false;
            this.commonServices.snackBar(errResp?.error?.error?.message, 'error')
          }
      });
   }

  initAutocomplete(maps: Maps) {
    const autocomplete = new maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      const  place  =  autocomplete.getPlace();
      this.container.address = this.gMapService.getAddresses(place?.address_components);
      this.container.address = {...this.container.address, geometry: {lng: place?.geometry?.location?.lng(), lat: place?.geometry?.location?.lat()}}
    });
  }

  // initAutocomplete() {
	// 	const  autocomplete  =  new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
	// 	google.maps.event.addListener(autocomplete, 'place_changed', () => {
	// 		const  place  =  autocomplete.getPlace();
  //     console.log(place);
  //     this.getAddresses(place?.address_components);

	// 		const  myLatlng  =  place?.geometry?.location;
	// 		const  map  =  new google.maps.Map(this.gmapElement.nativeElement, {
	// 			zoom:  15,
	// 			center:  myLatlng
	// 		});
	// 		const  marker  =  new google.maps.Marker({
  //       animation: google.maps.Animation.DROP,
	// 			position:  myLatlng,
	// 			title:  place.name,
  //       map,
	// 		});
	// 		// marker.setMap(map);
  //     marker.setDraggable(true)
  //     marker.addListener('dragend', (event: any) => {
  //       const geocoder = new google.maps.Geocoder();
  //       geocoder.geocode({location: event.latLng },  (results, status)=>{
  //         if (status == google.maps.GeocoderStatus.OK) {
  //           this.getAddresses(results?.find(a=>a.types.includes("street_address") && !a.plus_code)?.address_components);
  //         }
  //       })
  //     })
	// 	});
  // }
  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.signupForm.get(ctrlName) as FormControl);
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
      })
    });
  }
}
