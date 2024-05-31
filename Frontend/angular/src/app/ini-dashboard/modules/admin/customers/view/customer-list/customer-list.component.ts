import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, } from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProfileContainerComponent } from '../../dialog/profile-container/profile-container.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  categoriesDisplayedColumns: any = [
    { name: 'firstName', title: 'First Name', type: '' },
    { name: 'lastName', title: 'Last Name', type: '' },
    { name: 'email', title: 'Email', type: '' },
    { name: 'phone', title: 'Phone', type: '' },
    { name: 'createdAt', title: 'Created Date', type: 'date' },
    { name: 'action', title: '', type: '' },
  ];
  categoriesDataSource = new MatTableDataSource<any>([]);
  categoriesColumnsToDisp = this.categoriesDisplayedColumns.map((col: any) => col.name);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  container: any = {};
  total_count: number = 0;
  pageSize: number = 10;

  constructor(
    private paginator1: MatPaginatorIntl,
    private http: HttpClient,
    private location: Location,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getCategories();
    this.paginator1.itemsPerPageLabel = 'Rows per page:';
  }

  getCategories() {
    this.container['categoriesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/users?r=CUSTOMER`)
      .subscribe({
        next: (response: any) => {
          this.container['category'] = response.users;
          this.total_count = response.count;
          this.container['categoriesLoading'] = false;
        },
        error: (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      });
  }


  ngAfterViewInit() {
    this.categoriesDataSource.paginator = this.paginator;
  }
  onViewDetail(element: any) {
    const data = {};
    element.type = 'category';
    const categoryDialog = this.dialog.open(ProfileContainerComponent, {
      data: element,
      minWidth: '50%',
      maxHeight: '97%',
      disableClose: false,
    });

    categoryDialog.afterClosed().subscribe((response) => {
      this.container['category'] = [];
       this.getCategories();
    })
  }
}

