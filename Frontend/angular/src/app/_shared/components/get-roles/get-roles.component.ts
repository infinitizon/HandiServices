import { Component, Input, OnInit } from '@angular/core';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-get-roles',
  templateUrl: './get-roles.component.html',
  styleUrls: ['./get-roles.component.scss']
})
export class GetRolesComponent implements OnInit {

 roles!: any;

  role!: string;
  constructor(
    private authService: AuthService,
    public appContext: ApplicationContextService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    let roleUser = JSON.parse(this.auth.getRole());
    this.appContext.getUserInformation().subscribe({
      next: (data: any) => {
        if (data.Tenant) {
          this.roles = data.Tenant[0];
          if(!roleUser) {
          this.role = data.Tenant[0]?.Roles[0]?.name;
          this.authService.setRole(this.role ? this.role : 'CUSTOMER');
          } else {
            this.role = roleUser;
          }
          //     this.authService.setRole(this.role)
          //  } else if(data.Tenant.length = 0) {
          //    this.role = 'CUSTOMER';
        }
      },
    });
  }



  getRole() {
    this.authService.setRole(this.role);
    location.reload();
  }

}
