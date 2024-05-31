import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddXterPriceComponent } from '../../dialog/add-xter-price/add-xter-price.component';

@Component({
  selector: 'vendor-xter-price-list',
  templateUrl: './vendor-xter-price-list.component.html',
  styleUrls: ['./vendor-xter-price-list.component.scss']
})
export class VendorXterPriceListComponent implements OnInit {
  @Input() subCategory: any;
  @Input() category: any;

  categoriesDisplayedColumns: any = [
    { name: 'type', title: 'Type', type: '' },
    { name: 'price', title: 'Price', type: '' },
    { name: 'createdAt', title: 'Date', type: 'date' },
    { name: 'action', title: '', type: '' },
  ];
  categoriesDataSource= new MatTableDataSource<any>([]);
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
    this.container['pricesLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/admin/vendors/product-price/${this.subCategory.id}`)
      .subscribe(
        (response: any) => {
          this.container['vendorXterPrices'] = response.data;
          this.container['pricesLoading'] = false;
        },
        (errResp) => {
          this.container['pricesLoading'] = false;
        }
      );
  }


  viewCategory(element: any) {
    const data = {category: this.category, subCategory: this.subCategory};
    const categoryDialog = this.dialog.open(AddXterPriceComponent, {
      data: {...data, element},
      minWidth: '30%',
      disableClose: false,
    });

    categoryDialog.afterClosed().subscribe((response) => {
      // this.categoriesDataSource = new MatTableDataSource<any>([]);
        this.container['category'] = [];
      this.getCategories();
    })
  }


  ngAfterViewInit() {
    this.categoriesDataSource.paginator = this.paginator;
  }

}
