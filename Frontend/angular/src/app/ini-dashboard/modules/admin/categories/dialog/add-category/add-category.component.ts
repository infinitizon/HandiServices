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
  container: any = {
    imageFile: {link: "", file: {}, name: ""}
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
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      image: [null],
      title: [this.data?.title, [Validators.required]],
      summary: [this.data?.summary, [Validators.required]],
      sku: [this.data?.sku, [Validators.required]],
      type: [this.data?.type],
      description: [this.data?.summary],
      // pId: [this.data?.pId || '']
    })
    this.container['imageFile'] = {
      link: this.data?.Media?.find((i:any)=>i.objectType==="product-image")?.response?.url,
    };
    console.log(this.container['imageFile']);

  }

  onImagePicked(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.container['working-file'] = true;
      const reader = new FileReader();
      reader.onload = (_event: any) => {
          this.container['imageFile'] = {
              link: _event.target.result,
              file: event.srcElement.files[0],
              name: event.srcElement.files[0].name
          };
          this.container['working-file'] = false;
          this.categoryForm.patchValue({ image: event.target.files[0]});
      };
      reader.readAsDataURL(event.target.files[0]);
    }
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
      // const fd = JSON.parse(JSON.stringify(this.categoryForm.value));
      const formData: FormData = new FormData();
      // if(this.data.id) {
      //   Object.keys(this.data).forEach(key=>{
      //     key==='pId'?0:formData.append(key, this.data[key]);
      //   })
      // }
      Object.keys(this.categoryForm.getRawValue()).forEach(key=>{
        if(key === 'sub_category') {
          formData.append(`pId`, this.data.pId);
        }
        formData.append(key, this.categoryForm.getRawValue()[key]);
      })
      console.log(this.data);
      // return;

      (this.data?.id ?
        this.http.patch(`${environment.baseApiUrl}/admin/products/${this.data.id}`, formData) :
        this.http.post(`${environment.baseApiUrl}/admin/products`, formData))
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
