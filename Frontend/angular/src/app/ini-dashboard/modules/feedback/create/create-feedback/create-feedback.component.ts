import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IssueDTO, issueData } from './issue-data';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@app/_shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { take } from 'rxjs';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { FormErrors, ValidationMessages } from './create-feedback.validators';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-create-feedback',
  templateUrl: './create-feedback.component.html',
  styleUrls: ['./create-feedback.component.scss']
})
export class CreateFeedbackComponent implements OnInit {

  contactForm!: FormGroup;
  issueData: IssueDTO[] = issueData;
  container: any = {};
  submitting: boolean = false;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialog,
    public appContext: ApplicationContextService,
    public commonServices: CommonService
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      issue: ['', [Validators.required]],
      description: ['', [Validators.required]]
    })
  }


  onSubmit() {
    this.submitting = true;
    if (this.contactForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.contactForm
      );
      this.displayErrors();
      this.submitting = false;
      return;
    }

    const fd = JSON.parse(JSON.stringify(this.contactForm.value));
    this.http
      .post(`${environment.baseApiUrl}/users/feedback`, fd)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          this.successSnackBar('Complaint lodge successfully');
          this.contactForm.reset();
        },
        (errResp) => {
          this.submitting = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }


  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.contactForm.get(ctrlName) as FormControl
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
