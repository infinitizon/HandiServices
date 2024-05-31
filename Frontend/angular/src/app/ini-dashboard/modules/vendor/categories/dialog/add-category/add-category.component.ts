import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { Router } from '@angular/router';
import { FormErrors, ValidationMessages } from './add-category.validators';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      title: [this.data?.title, [Validators.required]],
      summary: [this.data?.summary, [Validators.required]],
      sku: [this.data?.sku, [Validators.required]],
      type: [this.data?.type],
      description: [''],
      // pId: [this.data?.pId || '']
    })
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
      fd.description = fd.summary;
      if(fd.type === 'sub_category') {
        fd.pId = this.data.pId
      }
      const payload = {...this.data, ...fd};
      (this.data?.id ? this.http
        .patch(`${environment.baseApiUrl}/admin/products/${this.data.id}`, payload) :
        this.http
        .post(`${environment.baseApiUrl}/admin/products`, fd))
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
