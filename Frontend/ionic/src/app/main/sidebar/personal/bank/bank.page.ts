import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrors, ValidationMessages } from './bank.validators';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@app/_shared/services/common.service';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.page.html',
  styleUrls: ['./bank.page.scss'],
})
export class BankPage implements OnInit {

  bankForm!: FormGroup;

  oldData!: any;
  selectedBank: any
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  bankSearchOptions = {
    endpoint: `${environment.baseApiUrl}/verifications/banks/list`,
    searchType: 'GET',
    title: 'Select your bank',
    key: 'code', label: 'name',
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private commonService: CommonService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.bankForm = this.fb.group({
      bankCode: ['', [Validators.required],],
      nuban: [ '', [ Validators.required, Validators.maxLength(10), Validators.pattern(/[0-9]+$/), Validators.minLength(10), ],],
      bankName: [ '', [Validators.required], ],
      bankAccountName: ['', [Validators.required], ],
    });
    this.fetchBeneficiary()
  }
  fetchBeneficiary() {
    this.loadingCtrl.create({
      message: 'Processing...',
    }).then(loadingEl=>{
      loadingEl.present();
      this.http.get(`${environment.baseApiUrl}/users/beneficiary`,)
        .subscribe({
          next: async (response: any) => {
            await loadingEl.dismiss();
            this.oldData = response?.data.find((b: any)=>b.active);
            this.bankForm.patchValue({
              bankCode: this.oldData?.bankCode,
              nuban: this.oldData?.accountNumber,
              bankName: this.oldData?.bankName,
              bankAccountName: this.oldData?.accountName,
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
  onSelectBank(data: any, modalNOK: IonModal) {
    this.selectedBank = data;
    console.log(this.selectedBank);

    this.bankForm.patchValue({
      bankCode: this.selectedBank['code'],
      bankName: this.selectedBank['name']
    });
    modalNOK.dismiss();
  }

  onNubanChanged(event: CustomEvent): any {
    let nuban = event?.detail?.value;
    if (!this.bankForm.get('bankCode')?.value) {
      this.bankForm?.get('nuban')?.patchValue(null, { emitEvent: false });
      this.toastCtrl.create({
        color: 'danger', duration: 3000, message: `Please select a bank first`
      }).then(toastEl=>{ toastEl.present(); });
      return null;
    }
    if (nuban?.length === 10) {
      this.loadingCtrl.create({
        message: 'Please wait...',
      }).then(loadingEl=>{
        loadingEl.present();
        const fd = { bankCode: this.bankForm.get('bankCode')?.value, nuban: nuban };
        this.http
          .post(`${environment.baseApiUrl}/verifications/nuban`, fd)
          .pipe(debounceTime(0), distinctUntilChanged())
          .subscribe({
            next: (resp: any) => {
              loadingEl.dismiss();
              this.bankForm.patchValue({
                bankAccountName: resp?.data?.accountName
              })
            },
            error: async (err) => {
              loadingEl.dismiss();
              const toast = await this.toastCtrl.create({
                header: 'Error', color: 'danger', duration: 3000,
                message: err?.error?.message || `Error fetching account information. Please try again later`
              });
              await toast.present()
            }
          });
      })
    }
  }
  onSubmitNOK() {
    this.bankForm.markAllAsTouched();
    if (this.bankForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonService.findInvalidControlsRecursive(this.bankForm);
      this.commonService.displayErrors(this.formErrors, ValidationMessages, this.errors, this.uiErrors);
      return;
    }
    let data: any = {};
    let fd = JSON.parse(JSON.stringify(this.bankForm.value));

    this.oldData?.bankCode != fd.bankCode ?(data['bankCode'] = fd.bankCode) : 0;
    this.oldData?.accountNumber != fd.nuban ? (data['nuban'] = fd.nuban) : 0;
    this.oldData?.bankName != fd.bankName ? (data['bankName'] = fd.bankName?.replace(' ', '')) : 0;
    this.oldData?.accountName != fd.bankAccountName ? (data['bankAccountName'] = fd.bankAccountName) : 0;

    if(Object.keys(data).length ===0) {
      this.toastCtrl.create({
        color: 'light', duration: 3000, message: `No changes detected`
      }).then(toastEl=>{ toastEl.present(); });
      return
    };
    this.http.post(`${environment.baseApiUrl}/users/beneficiary`, data)
      .subscribe({
        next: (response: any) => {
        },
        error: (err) => {
        }
    });
  }
}
