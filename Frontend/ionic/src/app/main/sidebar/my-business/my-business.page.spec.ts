import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBusinessPage } from './my-business.page';

describe('MyBusinessPage', () => {
  let component: MyBusinessPage;
  let fixture: ComponentFixture<MyBusinessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
