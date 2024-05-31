import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { CommonService } from '@app/_shared/services/common.service';
import {
  FormErrors,
  ValidationMessages,
} from './add-xter-price.validators';
import { environment } from '@environments/environment';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'po-add-xter-price',
  templateUrl: './add-xter-price.component.html',
  styleUrls: ['./add-xter-price.component.scss'],
})
export class AddXterPriceComponent implements OnInit {

  container: any = {};
  priceForm!: FormGroup;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  constructor(
    private fb: FormBuilder,
    private commonServices: CommonService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddXterPriceComponent>,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.getCategories();
    this.priceForm = this.fb.group({
      prices: this.fb.array([]),
    })
  }
  get prices():FormArray {
    return this.priceForm.get('prices') as FormArray;
  }
  addXterPrice(): void {
    this.prices.push(this.addGatewayGroup())
  }
  addGatewayGroup(): FormGroup {
    return this.fb.group({
      characteristic: [null, Validators.required],
      price: [null, Validators.required],
    })
  }
  onSelectBank(price: AbstractControl, i: any) {
    const description = price.get('description');
    if(price.get('price')?.value?.type === 'bank') {
      description?.setValidators(Validators.required)
    } else {
      description?.clearValidators()
    }
    description?.updateValueAndValidity()
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/product/${this.data?.category?.id}/xteristics`)
      .subscribe(
        (response: any) => {
          this.container['categories'] = response.data;
          // this.total_count = response.data.length;
          this.container['categoriesLoading'] = false;
        },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }
  deletePrice(i: number) {
    this.prices.removeAt(i)
  }
  onSubmit() {
    this.container['submitting'] = true;
    const payload = this.priceForm.value;
    // const unique = payload?.prices?.filter((obj: any, index: any) => { // This gives a unique set
    //   return index === payload?.prices?.findIndex((o: any) => (obj.characteristic === o.characteristic));
    // });
    const dupsInadditn = payload?.prices?.find((nnn: any, index: any) =>{//This shows the duplicate
      return payload?.prices?.find((x: any, ind: any)=> x.name === nnn.name && index !== ind )
    })
    if(dupsInadditn) {
      this.openSnackBar(`Please remove duplicate: ` + this.container['categories'].find((p: any) => p.id===dupsInadditn.characteristic)?.name );
      this.container['submitting'] = false;
      return;
    }

    this.http.post(`${environment.baseApiUrl}/admin/vendors/product-price/${this.data?.subCategory?.id}`, payload)
      .subscribe({
        next: (response: any) => {
          this.container['submitting'] = false;
          this.closeDialog();
          this.successSnackBar('Bank price saved Successfully');
        },
        error: (errResp: any) => {
          this.container['submitting'] = false;
          this.openSnackBar(errResp?.error?.error?.message);
      }
    });

  }

  successSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }
  displayErrors(): void {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
      this.uiErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
    });
  }
  closeDialog() {
    this.dialogRef.close();
  }

}
