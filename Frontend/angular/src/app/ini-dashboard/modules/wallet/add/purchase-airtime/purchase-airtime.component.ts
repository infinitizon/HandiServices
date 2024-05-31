import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormErrors, ValidationMessages } from './purchase-airtime';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'app-purchase-airtime',
  templateUrl: './purchase-airtime.component.html',
  styleUrls: ['./purchase-airtime.component.scss'],
})
export class PurchaseAirtimeComponent implements OnInit {
  airtimeForm!: FormGroup;

  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  networks: any[] = [
    {
      name: 'MTN',
      value: 'mtn'
    },
    {
      name: 'Airtel',
      value: 'airtel'
    },
    {
      name: 'GLO',
      value: 'glo'
    },
    {
      name: 'Etisalat',
      value: 'etisalat'
    }
  ];

  walletBalance: any;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient,
    public  appContext: ApplicationContextService,
    private _snackBar: MatSnackBar,
    ) {}

  ngOnInit() {
    this.airtimeForm = this.fb.group({
      network: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(11)]]
    });

    this.getWalletBalance();
  }


  clickAmount(amount: number) {
    this.airtimeForm.patchValue({
      amount: amount
    });
    this.amountChanged();
  }

  getWalletBalance() {
    this.container['walletBalanceLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/wallet/fetch`)
      .subscribe(
        (response: any) => {
          this.walletBalance = response.data;
          this.container['walletBalanceLoading'] = false;       },
        (errResp) => {
          this.container['walletBalanceLoading'] = false;
        }
      );
  }

  amountChanged() {
    const fd = JSON.parse(JSON.stringify(this.airtimeForm.value));
    if(fd.amount > this.walletBalance.total) {
      this.container["insufficient"] = "Insufficient Amount";
    } else {
      this.container["insufficient"] = '';
    }
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonService.controlnvalid(this.airtimeForm.get(ctrlName) as FormControl);
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  onSubmit() {
    // this.container['submittingWithdraw'] = true;
    // if (this.withdrawForm.invalid) {
    //   this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
    //   this.errors = this.commonService.findInvalidControlsRecursive(
    //     this.withdrawForm
    //   );
    //   this.displayErrors();
    //   this.container['submittingWithdraw'] = false;
    //   return;
    // }
    // const fd = JSON.parse(JSON.stringify(this.withdrawForm.value));

    // fd.split = 100;
    // fd.narration = `Transfer of ${fd.amount} to ${fd.banks.bankName} - ${fd.banks.accountNumber}`
    // fd.destination_account = fd.banks.accountNumber;
    // fd.destination_bank_name = fd.banks.bankName;
    // fd.destination_bank_code = fd.banks.bankCode;
    // fd.source_account = fd.banks.accountNumber;

    // delete fd.banks;

    // this.http
    //   .post(`${environment.baseApiUrl}/3rd-party-services/payment/transfer`, fd)
    //   .subscribe(
    //     (response: any) => {
    //       this.router.navigate(['/app/wallet/view']);
    //       this.container['submittingWithdraw'] = false;
    //       this.successSnackBar('Withdraw Successfully');
    //     },
    //     (response) => {
    //       this.container['submittingWithdraw'] = false;
    //       this.errorSnackBar(response?.error?.error?.message);
    //     }
    //   );
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
