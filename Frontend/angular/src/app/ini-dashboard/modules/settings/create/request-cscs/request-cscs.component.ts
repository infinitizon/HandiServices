import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-cscs',
  templateUrl: './request-cscs.component.html',
  styleUrls: ['./request-cscs.component.scss']
})
export class RequestCscsComponent implements OnInit {


  tabView: string = 'personal'
  tabProgress: number = 10;
  constructor() { }

  ngOnInit() {
  }


  nextTab() {
    this.tabView = 'accounts';
    this.tabProgress = 60;
  }

  prevTab() {
    this.tabView = 'personal';
    this.tabProgress = 10;
  }



}
