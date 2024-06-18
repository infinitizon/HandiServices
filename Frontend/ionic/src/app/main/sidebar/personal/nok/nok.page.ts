import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './nok.validators';
import { environment } from '@environments/environment';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { INOK } from '@app/_shared/models/nok.interface';

@Component({
  selector: 'app-nok',
  templateUrl: './nok.page.html',
  styleUrls: ['./nok.page.scss'],
})
export class NokPage implements OnInit {

  nokForm!: FormGroup;

  oldData!: INOK;
  container = {
    oldData: {}
  }
  selectedNOKRelationship: any
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  nokSearchOptions = {
    endpoint: `${environment.baseApiUrl}/lovs/nok/relationship`,
    searchType: 'GET',
    title: 'Select relationship with next of kin',
    key: 'code', label: 'label',
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.nokForm = this.fb.group({
      relationship: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(this.commonService.email)]],
      address: ['', [Validators.required]],
    });
    this.fetchNOK()
  }
  fetchNOK() {
    this.loadingCtrl.create({
      message: 'Processing...',
    }).then(loadingEl=>{
      loadingEl.present();
      this.http.get(`${environment.baseApiUrl}/users/nok`,)
        .subscribe({
          next: async (response: any) => {
            await loadingEl.dismiss();
            this.oldData = response?.data;
            this.nokForm.patchValue({
              relationship: response.data?.relationship?.label,
              name: response.data?.name,
              phone: response.data?.phone,
              email: response.data?.email,
              address: response.data?.address,
            })
          },
          error: async err => {
            await loadingEl.dismiss();
            const toast = await this.toastCtrl.create({
              header: 'Error', color: 'danger', duration: 3000,
              message: err?.error?.message || `Error updating your next of kin information`
            });
            await toast.present()
          }
        });
    });
  }

  onSelectNOK(data: any, modalNOK: IonModal) {
    this.selectedNOKRelationship = data;
    console.log(this.selectedNOKRelationship);

    this.nokForm.patchValue({
      relationship: this.selectedNOKRelationship['label']
    });
    modalNOK.dismiss();
  }
  onSubmitNOK() {
    this.nokForm.markAllAsTouched();
    if (this.nokForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.nokForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }

    let data: any = {};
    let fd = JSON.parse(JSON.stringify(this.nokForm.value));
    this.oldData?.relationship.label != fd.relationship ?(data['relationship'] = fd.relationship) : 0;
    this.oldData?.name != fd.name ? (data['name'] = fd.name) : 0;
    this.oldData?.phone != fd.phone ? (data['phone'] = fd.phone?.replace(' ', '')) : 0;
    this.oldData?.email != fd.email ? (data['email'] = fd.email) : 0;
    this.oldData?.address != fd.address ? (data['address'] = fd.address) : 0;

    if(Object.keys(data).length ===0) {
      this.toastCtrl.create({
        color: 'light', duration: 3000, message: `No changes detected`
      }).then(toastEl=>{ toastEl.present(); });
      return
    };

    this.loadingCtrl.create({
      message: 'Processing...',
    }).then(loadingEl=>{
      loadingEl.present();
      (this.oldData?.id ? this.http.patch(`${environment.baseApiUrl}/users/nok/${this.oldData.id}`, data,) : this.http.post(`${environment.baseApiUrl}/users/nok`, data))
        .subscribe({
          next: async (response: any) => {
            await loadingEl.dismiss();
            const toast = await this.toastCtrl.create({
              header: 'Success', color: 'success', duration: 3000,
              message: response?.message||`Next of Kin information updated successfully`
            });
            await toast.present()
          },
          error: async err => {
            await loadingEl.dismiss();
            const toast = await this.toastCtrl.create({
              header: 'Error', color: 'danger', duration: 3000,
              message: err?.error?.message || `Error updating your next of kin information`
            });
            await toast.present()
          }
       });
    })

  }
}
