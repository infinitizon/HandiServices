import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.page.html',
  styleUrls: ['./sidebar.page.scss'],
})
export class SidebarPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log();
  }

  onImagePicked(event: string |File) {
    console.log(event);

  }
}
