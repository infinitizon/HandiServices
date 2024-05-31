import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html',
  styleUrls: ['./view-feedback.component.scss']
})
export class ViewFeedbackComponent implements OnInit {
  vendorsDisplayedColumns: any = [
    { name: 'user', title: 'User', type: '' },
    { name: 'issue', title: 'Category', type: '' },
    { name: 'description', title: 'Description', type: '' },
    { name: 'createdAt', title: 'Date', type: 'date' }
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
  ) { }

  ngOnInit() {
    this.getCategories();
    this.paginator1.itemsPerPageLabel = 'Rows per page:';
  }

  getCategories() {
    this.container['vendorsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/feedback`)
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

}
