import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { GetStartedComponent } from '@app/_shared/dialogs/get-started/get-started.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-recommended',
  templateUrl: './view-recommended.component.html',
  styleUrls: ['./view-recommended.component.scss']
})
export class ViewRecommendedComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private http: HttpClient
  ) {  }

  ngOnInit() {
  }
}
