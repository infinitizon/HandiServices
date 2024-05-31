/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrderChatComponent } from './order-chat.component';

describe('OrderChatComponent', () => {
  let component: OrderChatComponent;
  let fixture: ComponentFixture<OrderChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
