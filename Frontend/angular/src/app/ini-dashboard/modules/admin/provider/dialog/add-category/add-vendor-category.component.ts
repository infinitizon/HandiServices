import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { Router } from '@angular/router';
import { FormErrors, ValidationMessages } from './add-vendor-category.validators';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-vendor-category',
  templateUrl: './add-vendor-category.component.html',
  styleUrls: ['./add-vendor-category.component.scss']
})
export class AddVendorCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddVendorCategoryComponent>,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.getCategories();
    this.categoryForm = this.fb.group({
      subCategories: [this.data?.title, [Validators.required]],
    });

  }


  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category/${this.data.category}`)
      .subscribe(
        (response: any) => {
          this.container.categories = response.data;
          // this.total_count = response.data.length;
          this.container['categoriesLoading'] = false;
        },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }
  submit() {
      this.container['submitting'] = true;
      if (this.categoryForm.invalid) {
        this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
        this.errors = this.commonService.findInvalidControlsRecursive(
          this.categoryForm
        );
        this.displayErrors();
        this.container['submitting'] = false;
        return;
      }
      const fd = JSON.parse(JSON.stringify(this.categoryForm.value));
      this.http.post(`${environment.baseApiUrl}/admin/vendors/category`, fd)
        .subscribe(
          (response: any) => {
            this.container['submitting'] = false;
            this.successSnackBar('Category Saved Successfully');
            this.dialogRef.close();
          },
          (response) => {
            this.container['submitting'] = false;
            this.errorSnackBar(response?.error?.error?.message);
          }
        );
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



  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.categoryForm.get(ctrlName) as FormControl);
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
