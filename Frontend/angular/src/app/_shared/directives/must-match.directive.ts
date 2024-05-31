import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[inMustMatch]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MustMatchDirective, multi: true }]
})
export class MustMatchDirective implements Validator {

  @Input('inMustMatch') mustMatch: any = '';

  validate(control: AbstractControl): ValidationErrors {
    return mustMatchValidator(this.mustMatch)(control);
  }
  // registerOnValidatorChange?(fn: () => void): void {
  //   throw new Error('Method not implemented.');
  // }

}

function mustMatchValidator(matchingControlName: any): ValidatorFn {
  return (formControl: AbstractControl): ValidationErrors | null => {
    const control = formControl;
    const matchingControl = formControl.parent.controls[matchingControlName];
    // console.log('matchingControl', matchingControl);
    // console.log('control', control);


    // return null if controls haven't initialised yet
    if (!control || !matchingControl) {
      // console.log('not yet');
      return null;
    }

    // return null if another validator has already found an error on the control not working
    // if (control.errors && !control.errors.mustMatch) {
    //   // console.log('other errors', control.value, matchingControl.value);
    //   // console.log('other errors',control.errors, control.errors.mustMatch);
    //   return null;
    // }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      // console.log('yes', control.value, matchingControl.value);
      // formControl.setErrors({ mustMatch: true });
      return { mustMatch: true }
    } else {
      // console.log('no');
      // formControl.setErrors(null);
      return null
    }
  };
}
