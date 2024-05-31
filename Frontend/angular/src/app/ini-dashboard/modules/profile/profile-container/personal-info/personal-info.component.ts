import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {

  infoForm!: FormGroup;
  container: any = {};
  userInformation!: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    public appContext: ApplicationContextService,
    private http: HttpClient,
    ) { }

  ngOnInit() {
    this.appContext
    .getUserInformation()
    .subscribe({
      next: (data: any) => {
        this.userInformation = data;
        if(this.userInformation)
          this.userInformation['avatar'] = this.userInformation?.Media?.find((i:any)=>i.objectType==="avatar")?.response;

        this.infoForm = this.fb.group({
          fullName: [this.userInformation?.firstName + ' ' + this.userInformation?.lastName],
          email: [this.userInformation?.email],
          phone: [this.userInformation?.phone],
          address: ['']
      })

      },
    });

  }
  fileChangeEvent(fileInput: any) {
    // this.imageError = null;
    this.uploadAvatar(fileInput.target.files[0]);
  }

  uploadAvatar(avatarImageBase64: any) {
    // this.commonService.showLoading(this.uploadAvatarButton.nativeElement);
    console.log(avatarImageBase64);

    const formData: FormData = new FormData();
    formData.append('avatar', avatarImageBase64, avatarImageBase64.name);
    this.http
      .patch(`${environment.baseApiUrl}/users/profile/update`, formData)
      .subscribe(
        (response: any) => {
          this.userInformation.image = avatarImageBase64;
          this.commonService.snackBar(response.message);
          // this.commonService.removeLoading(
          //   this.uploadAvatarButton.nativeElement
          // );
        },
        (response) => {
          this.commonService.snackBar(response.message, 'error');
          // this.commonService.removeLoading(
          //   this.uploadAvatarButton.nativeElement
          // );
        }
      );
  }
}


