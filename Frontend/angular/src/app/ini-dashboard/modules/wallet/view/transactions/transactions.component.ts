import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  txnsDisplayedColumns: any = [
    { name: 'name', title: 'Name', type: '' },
    { name: 'email', title: 'Email', type: '' },
    { name: 'amount', title: 'Amount (NGN)', type: 'money' },
    { name: 'gateway', title: 'Gateway', type: '' },
    { name: 'reference', title: 'Reference', type: '' },
    { name: 'status', title: 'Status', type: 'status' },
    { name: 'date', title: 'Date', type: 'date' }
  ];
  txnsDataSource = new MatTableDataSource<any>([]);
  txnsColumnsToDisp = this.txnsDisplayedColumns.map((col: any) => col.name);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  container: any = {};
  total_count: number = 0;
  pageSize: number = 10;

  constructor(
    private paginator1: MatPaginatorIntl,
    private http: HttpClient,
    private location: Location,
  ) { }

  ngOnInit() {
    this.getTxns();
    this.paginator1.itemsPerPageLabel = 'Rows per page:';
  }

  getTxns() {
    this.container['txnsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/transactions`)
      .subscribe(
        (response: any) => {
          console.log(response);
          this.txnsDataSource = new MatTableDataSource<any>(response.data);
          this.total_count = response.data.length;
          this.container['txnsLoading'] = false;
        },
        (errResp) => {
          this.container['txnsLoading'] = false;
        }
      );
  }


  ngAfterViewInit() {
    this.txnsDataSource.paginator = this.paginator;
  }

  goBack() {
    this.location.back();
  }

}
