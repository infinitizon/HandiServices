import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'd-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {

  @Input('data') data: any
  infoForm!: FormGroup;
  container: any = {};
  userInformation!: any;

  constructor(
    private fb: FormBuilder,
    public appContext: ApplicationContextService,
    ) { }

  ngOnInit() {
    if(this.data) {
      this.infoForm = this.fb.group({
        fullName: [this.data?.firstName + ' ' + this.data?.lastName],
        email: [this.data?.email],
        phone: [this.data?.phone],
        address: ['']
      })

    } else {
      this.appContext
      .getUserInformation()
      .subscribe({
        next: (data: any) => {
          this.userInformation = data;
          this.infoForm = this.fb.group({
            fullName: [this.userInformation?.firstName + ' ' + this.userInformation?.lastName],
            email: [this.userInformation?.email],
            phone: [this.userInformation?.phone],
            address: ['']
          })
        },
      });
    }
  }

}


