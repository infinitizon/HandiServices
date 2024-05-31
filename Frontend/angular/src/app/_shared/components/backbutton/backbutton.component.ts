import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'in-backbutton',
  templateUrl: './backbutton.component.html',
  styleUrls: ['./backbutton.component.scss']
})
export class BackbuttonComponent {


    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }

}
