import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-utilities',
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.scss']
})
export class UtilitiesComponent implements OnInit {

  constructor(
    private location: Location,
  ) { }

  ngOnInit() {
  }



  goBack() {
    this.location.back();
}

}
