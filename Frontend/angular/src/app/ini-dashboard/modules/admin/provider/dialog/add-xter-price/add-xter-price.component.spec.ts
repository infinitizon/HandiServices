/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddXterPriceComponent } from './add-xter-price.component';

describe('AddXterPriceComponent', () => {
  let component: AddXterPriceComponent;
  let fixture: ComponentFixture<AddXterPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddXterPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddXterPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
