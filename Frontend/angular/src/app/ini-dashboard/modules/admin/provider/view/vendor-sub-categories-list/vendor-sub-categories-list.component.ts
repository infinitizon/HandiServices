import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddVendorCategoryComponent } from '../../dialog/add-category/add-vendor-category.component';

@Component({
  selector: 'vendor-sub-categories-list',
  templateUrl: './vendor-sub-categories-list.component.html',
  styleUrls: ['./vendor-sub-categories-list.component.scss']
})
export class VendorSubCategoriesListComponent implements OnInit {
 @Input() category: any;

 categoriesDisplayedColumns: any = [
  { name: 'expand', title:  '', type: 'expand' },
  { name: 'title', title: 'Title', type: '' },
  { name: 'summary', title: 'Summary', type: '' },
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
  this.container['categoriesLoading'] = true;
  this.http
    .get(`${environment.baseApiUrl}/admin/products/sub-category/${this.category.id}`)
    .subscribe(
      (response: any) => {
        this.container['category'] = response.data;
        // this.categoriesDataSource = new MatTableDataSource<any>(response);
        // this.total_count = response.data.length;
        this.container['categoriesLoading'] = false;
      },
      (errResp) => {
        this.container['categoriesLoading'] = false;
      }
    );
}


viewCategory(element: any) {
  const data = {category: this.category.id};
  element.type = 'sub_category';
  const categoryDialog = this.dialog.open(AddVendorCategoryComponent, {
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
