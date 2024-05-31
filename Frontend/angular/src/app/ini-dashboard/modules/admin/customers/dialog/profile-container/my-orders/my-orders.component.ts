import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'ngx-lottie/lib/symbols';

@Component({
  selector: 'd-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  @Input('data') data: any

  options: AnimationOptions = {
    path: 'https://assets2.lottiefiles.com/packages/lf20_olbyptqd.json',
  };

  constructor() { }

  ngOnInit() {
  }

  animationCreated(animationItem: AnimationItem): void {
    // console.log(animationItem);
  }

}
