import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-vendor-users-list',
  templateUrl: './vendor-users-list.component.html',
  styleUrls: ['./vendor-users-list.component.scss']
})
export class VendorUsersListComponent implements OnInit {
  @Input('tenant') tenant : any;
  tenantsCustDisplayedColumns: any = [
    { name: 'subscribers', title: 'User', type: 'subscribers' },
    { name: 'role', title: 'Role', type: 'role' },
    { name: 'tenant', title: 'Tenant', type: 'tenant' },
    { name: 'email', title: 'Email', type: '' },
    // { name: 'date', title: 'Date subscribed', type: 'date' },
    // { name: 'status', title: 'Status', type: 'status' },
    { name: 'action', title: '', type: 'action' },
  ];
  tenantsCustDataSource = new MatTableDataSource<any>([]);
  tenantsCustColumnsToDisp = this.tenantsCustDisplayedColumns.map((col: any) => col.name);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  container: any = {};

  constructor(
    private paginator1: MatPaginatorIntl,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.paginator1.itemsPerPageLabel = 'Rows per page:';
    this.getSubscribers();
  }

  getSubscribers() {
    this.container['subscribersLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/users?r=PROVIDER,PROVIDER_ADMIN&tenantId=${this.tenant.id}`)
      .subscribe(
        (response: any) => {
          this.tenantsCustDataSource = response.users;
          this.container['subscribersLoading'] = false;
        },
        (errResp) => {
          this.container['subscribersLoading'] = false;
        }
      );
  }



  ngAfterViewInit() {
    this.tenantsCustDataSource.paginator = this.paginator;
  }

}

