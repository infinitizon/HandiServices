import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import {  BehaviorSubject, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { SnackBarComponent } from '../components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  url = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  oneDigit = /\d/;
  onlyDigits = /[0-9]+$/;
  oneLowerCase = /[a-z]/;
  mutiple1000 = /^[1-9]+[0-9]*000$/;
  oneUpperCase = /[A-Z]/;
  specialChar = /[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();
  public subscriptions: Subscription[] = [];

  container: any = {};

  constructor(
    // public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  showLoading(button: any) {
    var $this = $(button);

    var loadingText = 'loading...';
    if ($this.html() !== loadingText) {
      $this.prop('disabled', true);
      $this.data('original-text', $this.html());
      $this.html(loadingText);
    }
  }



  removeLoading(button: any) {
    var $this = $(button);
    $this.prop('disabled', false);
    $this.html($this.data('original-text'));
    $this.data('original-text', null);
  }
  getLOVs(endpoint: string, selectScope: string, container: any, options: any) {

    if (container[selectScope] == null) {
      container[options['loading']] = 'Loading, please wait...';
      this.http.get(endpoint)
      .pipe(
        // map(response => of(response.data),
        // map(response => response.data.filter(x => x != null))
      )
          .subscribe(
            (response: any) => {
              // console.log(response);
              container[options['loading']] = null;
              container[selectScope] = response.data;
              // console.log(container[selectScope]);
            },
            (err) => {
              container[options['loading']] = null;
              // // console.log(err);
            }
          );
    }
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
          return;
      }
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
      } else {
          matchingControl.setErrors(null);
      }
    }
  }
  crossFieldValidation(controlName: string, matchingControlName: string, errorToCheck: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      let error: any = {};
      error[errorToCheck] = true;

      if (matchingControl.errors && !matchingControl.errors[errorToCheck]) {
          return;
      }
      if ((control.value !== matchingControl.value) && errorToCheck == 'mustMatch') {
        matchingControl.setErrors(error);
      } else if ((control.value === matchingControl.value) && errorToCheck == 'mustNotMatch') {
        matchingControl.setErrors(error);
      } else if ((control.value) && errorToCheck == 'required') {
        matchingControl.setErrors(error);
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | any => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }
  findInvalidControlsRecursive(formToInvestigate: UntypedFormGroup|UntypedFormArray): string[] {
    const invalidControls: any = {};
    const recursiveFunc = (form: UntypedFormGroup|UntypedFormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control?.invalid && !(control instanceof UntypedFormArray) && !(control instanceof UntypedFormGroup)) {
          invalidControls[field] = control.errors;
        }
        if (control instanceof UntypedFormGroup) {
          recursiveFunc(control);
        } else if (control instanceof UntypedFormArray) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  controlnvalid(controlToInvestigate: FormControl | any): string[] | any {
    const invalidControls: any = {};
    if (controlToInvestigate?.invalid ) {
      const controlName: any = (Object.keys(controlToInvestigate.parent.controls).find(key => controlToInvestigate.parent.controls[key] === controlToInvestigate))
      invalidControls[controlName] = controlToInvestigate.errors;
    }
    return invalidControls;
  }

  displayErrors(formErrors: any, ValidationMessages: any, errors: any, uiErrors: any) {
    Object.keys(formErrors).forEach((control) => {
      formErrors[control] = '';
    });
    Object.keys(errors).forEach((control) => {
      Object.keys(errors[control]).forEach(error => {
        uiErrors[control] = ValidationMessages[control][error];
      })
    });
    return {formErrors: formErrors, uiErrors: uiErrors};
  }


  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString });
  }

  snackBar(message: string, successOrError='success') {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: [successOrError],
    });
  }
}
