import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss']
})
export class VendorsListComponent implements OnInit {
  vendorsDisplayedColumns: any = [
    { name: 'name', title: 'Business Name', type: '' },
    { name: 'email', title: 'Email', type: '' },
    { name: 'phone', title: 'phone', type: '' },
    // { name: 'createdAt', title: 'Date', type: 'date' }
  ];
  vendorsDataSource = new MatTableDataSource<any>([]);
  vendorsColumnsToDisp = this.vendorsDisplayedColumns.map((col: any) => col.name);

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
    this.container['vendorsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/vendors`)
      .subscribe(
        (response: any) => {
          this.vendorsDataSource = new MatTableDataSource<any>(response.data);
          // this.total_count = response.data.length;
          this.container['vendorsLoading'] = false;
        },
        (errResp) => {
          this.container['vendorsLoading'] = false;
        }
      );
  }


  ngAfterViewInit() {
    this.vendorsDataSource.paginator = this.paginator;
  }



  goBack() {
    this.location.back();
  }

}

