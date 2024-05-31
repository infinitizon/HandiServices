import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrors, ValidationMessages } from './create-bank.validators';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-bank',
  templateUrl: './create-bank.component.html',
  styleUrls: ['./create-bank.component.scss']
})
export class CreateBankComponent implements OnInit {

  createBankForm!: FormGroup;

  container: any = {}
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  banks: any[] = [];

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient,
    public appContext: ApplicationContextService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.createBankForm = this.fb.group({
      nuban: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/[0-9]+$/),
          Validators.minLength(10),
        ],
      ],
      bankCode: [
        '',
        [Validators.required],
      ],
    });

    this.getBanks();
  }

  getBanks() {
    this.container['banksLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/verifications/banks/list`)
      .subscribe(
        (response: any) => {
          this.banks = response.data;
          this.container['banksLoading'] = false;       },
        (errResp) => {
          this.container['banksLoading'] = false;
        }
      );
  }


  onNubanChanged(): any {
    let nuban = this.createBankForm.get('nuban')?.value;
    if (!this.createBankForm.get('bankCode')?.value) {
      this.createBankForm
        ?.get('nuban')
        ?.patchValue(null, { emitEvent: false });
        this.container['bankAccountName'] = {
          success: false,
          name: 'Select bank',
        };
      return null;
    }
    this.container['bankAccountName'] = {
      success: false,
      name: '',
    };
    if (nuban?.length === 10) {
      const chosenBank = this.createBankForm.get('bankCode')?.value;
      this.container['loadingBankName'] = true;
      const fd = { bankCode: chosenBank?.code, nuban: nuban };
      this.http
        .post(`${environment.baseApiUrl}/verifications/nuban`, fd)
        .pipe(debounceTime(0), distinctUntilChanged())
        .subscribe(
          (resp: any) => {
            this.container['loadingBankName'] = false;
            this.container['bankAccountName'] = {
              success: true,
              name: resp?.data?.accountName,
            };
          },
          (errResp) => {
            this.container['loadingBankName'] = false;
            // this.toastr.error(
            //   'Error verifying account. Please try again later'
            // );
            this.container['bankAccountName'] = {
              success: false,
              name: errResp?.error?.error?.message,
            };
          }
        );
    }
  }

  onSubmitBank(): void {
    this.container['submittingBank'] = true;
    if (this.createBankForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonService.findInvalidControlsRecursive(
        this.createBankForm
      );
      this.displayErrors();
      this.container['submittingBank'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.createBankForm.value));
    fd.bankName = fd.bankCode.name;
    fd.bankCode = fd.bankCode.code;
    fd.bankAccountName = this.container['bankAccountName']?.name;
    this.http
      .post(`${environment.baseApiUrl}/users/beneficiary`, fd)
      .subscribe(
        (response: any) => {
          this.router.navigate(['/app/wallet/banks-list']);
          this.container['submittingBank'] = false;
          this.successSnackBar('Bank Saved Successfully');
        },
        (response) => {
          this.container['submittingBank'] = false;
          this.errorSnackBar(response?.error?.error?.message);
        }
      );
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
    });
  }



  goBack() {
    this.location.back();
}

errorSnackBar(message: string) {
  this._snackBar.openFromComponent(SnackBarComponent, {
    duration: 2000,
    data: {
      message: message,
      icon: 'ri-close-circle-fill',
    },
    panelClass: ['error'],
  });
}

successSnackBar(message: string) {
  this._snackBar.openFromComponent(SnackBarComponent, {
    duration: 2000,
    data: {
      message: message,
      icon: 'ri-close-circle-fill',
    },
    panelClass: ['success'],
  });
}

}
