import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  container: any = {};
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;
  mainSubscription$!: Subscription;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderDetailComponent>,
    private http: HttpClient,
  ) {}

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.getOrders();
  }

  getOrders() {
    this.mainSubscription$ = this.paginator.page
    .pipe(
      startWith({}),
      switchMap(() => {
        return   this.http.get(`${environment.baseApiUrl}/users/cart?orderId=${this.data.id}&page=${this.paginator.pageIndex}&perPage=${this.paginator.pageSize}`)
      })
    ).subscribe({
        next: (response: any) => {
          this.container.orders = response.data;
          // console.log(this.container.orders);
          this.container.total = response.count;
          this.container['ordersLoading'] = false;
        },
        error: (errResp) => {
          // this.container['paymentLoading'] = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.mainSubscription$.unsubscribe();
  }
}
