import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from '../../dialog/add-category/add-category.component';

@Component({
  selector: 'app-sub-categories-list',
  templateUrl: './sub-categories-list.component.html',
  styleUrls: ['./sub-categories-list.component.scss']
})
export class SubCategoriesListComponent implements OnInit {
 @Input() subCategory: any;

 categoriesDisplayedColumns: any = [
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
    .get(`${environment.baseApiUrl}/products/category/${this.subCategory.id}`)
    .subscribe(
      (response: any) => {
        this.categoriesDataSource = new MatTableDataSource<any>(response.data);
        // this.total_count = response.data.length;
        this.container['categoriesLoading'] = false;
      },
      (errResp) => {
        this.container['categoriesLoading'] = false;
      }
    );
}


viewCategory(element: any) {
  const data = {};
  element.type = 'sub_category';
  const categoryDialog = this.dialog.open(AddCategoryComponent, {
    data: element,
    minWidth: '30%',
    disableClose: false,
  });

  categoryDialog.afterClosed().subscribe((response) => {
    this.categoriesDataSource = new MatTableDataSource<any>([]);
     this.getCategories();
  })
}


ngAfterViewInit() {
  this.categoriesDataSource.paginator = this.paginator;
}

}
