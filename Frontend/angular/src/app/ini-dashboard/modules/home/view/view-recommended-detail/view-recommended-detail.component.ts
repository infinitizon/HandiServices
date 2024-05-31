import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-recommended-detail',
  templateUrl: './view-recommended-detail.component.html',
  styleUrls: ['./view-recommended-detail.component.scss']
})
export class ViewRecommendedDetailComponent implements OnInit {
  container = {};

  constructor(
    public commonServices: CommonService,
    private http: HttpClient,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewRecommendedDetailComponent>,
    private router: Router,
  ) {}

  ngOnInit() {
    // console.log(this.data);
    this.getServices();
  }
  getServices() {
    this.container['categoriesLoading'] = true;
    const category = this.data.Products?.find(p=>!p.pId)
    this.http
      .get(`${environment.baseApiUrl}/products/category/${category.id}?tenantId=${category?.TenantCategory?.tenantId}`)
      .subscribe(
        (response: any) => {
          this.container['providerServices'] = response.data;
          // this.total_count = response.data.length;
          this.container['categoriesLoading'] = false;
        },
        (errResp) => {
          this.container['categoriesLoading'] = false;
        }
      );
  }
  navigateToProviderXteristics(service: any) {
    this.dialogRef.close();
    this.router.navigate(['/app/home/view-checkout', this.data.id, service.id, 'characteristics'])
  }
}
