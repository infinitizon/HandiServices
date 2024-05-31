/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GetRolesComponent } from './get-roles.component';

describe('GetRolesComponent', () => {
  let component: GetRolesComponent;
  let fixture: ComponentFixture<GetRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
