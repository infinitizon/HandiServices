import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-category',
  templateUrl: './user-category.component.html',
  styleUrls: ['./user-category.component.scss']
})
export class UserCategoryComponent implements OnInit {



  tab = '';
  constructor() { }

  ngOnInit() {
  }



  tabChanged(tab: string) {
     this.tab = tab;
  }

}
