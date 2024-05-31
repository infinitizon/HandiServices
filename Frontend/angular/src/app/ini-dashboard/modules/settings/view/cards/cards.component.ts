import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, AfterViewInit{

  constructor() { }

  ngOnInit() {
  }


  ngAfterViewInit() {
    jQuery(document).ready(function($){
      $('ul.cards').on('click', function(){
        $(this).toggleClass('transition');
      });

      $('ul.card-stacks').on('click', function(){
        $(this).toggleClass('transition');
      });

      $('ul.cards-split').on('click', function(){
        $(this).toggleClass('transition');
      });

      $('ul.cards-split-delay').on('click', function(){
        $(this).toggleClass('transition');
      });
    });
  }

}
