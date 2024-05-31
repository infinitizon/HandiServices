import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { Router } from '@angular/router';
import { FormErrors, ValidationMessages } from './add-product-xter.validators';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-product-xter',
  templateUrl: './add-product-xter.component.html',
  styleUrls: ['./add-product-xter.component.scss']
})
export class AddProductXterComponent implements OnInit {
  categoryForm!: FormGroup;
  container: any = {
    dispTypes: [
      {id: 'inc_dcr', name: 'Increment-Decrement'},
      {id: 'range', name: 'Range'},
      {id: 'string', name: 'Simple string input'},
      {id: 'number', name: 'Simple number input'},
      {id: 'mcma', name: 'Multi-Choice Multi-Answer'},
      {id: 'mcsa', name: 'Multi-Choice Multi-Answer'},
    ]
  };
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddProductXterComponent>,
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    console.log(this.data?.Product);

    this.categoryForm = this.fb.group({
      category: [this.data?.Product?.id, [Validators.required]],
      name: [this.data?.name, [Validators.required]],
      type: [this.data?.type, [Validators.required]],
      minPrice: [this.data?.minPrice, [Validators.required]],
      maxPrice: [this.data?.maxPrice, [Validators.required]],
    })
    this.getCategories();
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/products/category`)
      .subscribe(
        (response: any) => {
          this.container['categories'] = response;
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
      // Check for changes
      (this.data?.maxPrice == fd.maxPrice ) ? delete fd.maxPrice : 0;
      (this.data?.minPrice == fd.minPrice ) ? delete fd.minPrice : 0;
      (this.data?.misc == fd.misc ) ? delete fd.misc : 0;
      (this.data?.name == fd.name ) ? delete fd.name : 0;
      (this.data?.type == fd.type ) ? delete fd.type : 0;

      if(Object.keys(fd)?.length === 1 && fd.category) {
        this.errorSnackBar('There are no changes detected');
        this.container['submitting'] = false;
        return;
      }
      // console.log(fd);return;
      // const payload = {...this.data, ...fd};
      (this.data?.id ? this.http
        .patch(`${environment.baseApiUrl}/admin/product/xteristics/${this.data.id}`, fd) :
        this.http
        .post(`${environment.baseApiUrl}/admin/product/xteristics`, fd))
        .subscribe(
          (response: any) => {
            this.container['submitting'] = false;
            this.successSnackBar(response.message);
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
