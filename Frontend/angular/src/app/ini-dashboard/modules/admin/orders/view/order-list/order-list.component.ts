import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, } from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  categoriesDisplayedColumns: any = [
    { name: 'id', title: 'Order ID', type: '' },
    { name: 'User', title: 'Customer', type: '' },
    { name: 'totalitems', title: 'Total Items', type: '' },
    { name: 'status', title: 'Status', type: '' },
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
      .get(`${environment.baseApiUrl}/admin/vendor/orders`)
      .subscribe({
        next: (response: any) => {
          this.container['category'] = response.data;
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
}

