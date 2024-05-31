import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-faq',
  templateUrl: './view-faq.component.html',
  styleUrls: ['./view-faq.component.scss']
})
export class ViewFaqComponent implements OnInit {

  panelOpenState = false;
  
  constructor() { }

  ngOnInit() {
  }

}
