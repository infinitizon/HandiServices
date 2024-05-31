import {
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './password-change.validators';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Crypto } from '@app/_shared/classes/Crypto';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/_shared/services/auth.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss'],
})
export class PasswordChangeComponent implements OnInit {
  container = {};
  resetPasswordForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  addressForm!: FormGroup;
  submitting = false;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PasswordChangeComponent>,
    private http: HttpClient,
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
  }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group(
      {
        oldPassword: ['',    Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneDigit),
              { oneDigit: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneLowerCase),
              { oneLowerCase: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.oneUpperCase),
              { oneUpperCase: '' }
            ),
            this.commonServices.regexValidator(
              new RegExp(this.commonServices.specialChar),
              { specialChar: '' }
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.commonServices.mustMatch(
          'password',
          'confirmPassword'
        ),
      }
    );

  }


  clearPassword(field: string) {
    this.resetPasswordForm.get(field)?.patchValue('');
  }

  submit() {
    this.submitting = true;
    if (this.resetPasswordForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(FormErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(this.resetPasswordForm);
      this.displayErrors();
      this.submitting = false;
      console.log(this.uiErrors, this.errors);

      return;
    }
    const fd = {
      oldPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('oldPassword').value),
      newPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('password').value),
      confirmNewPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('confirmPassword').value),
    };
    this.http.post(`${environment.baseApiUrl}/auth/change-password`,  fd)
      .subscribe((response: any) => {
        this.submitting = false;
        // this.commonServices.showLoading(this.submitButton.nativeElement);
        this.commonServices.snackBar(response?.message + '\nChange will take effect on next login');
        this.auth.logout();
      },
      errResp => {
         this.submitting = false;
        this.commonServices.snackBar(errResp?.error?.error.message, 'error');
        this.resetPasswordForm.reset();
      });
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.resetPasswordForm.get(ctrlName) as FormControl
    );
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
      });
    });
  }

}
