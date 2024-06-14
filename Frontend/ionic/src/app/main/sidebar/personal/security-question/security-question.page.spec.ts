import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityQuestionPage } from './security-question.page';

describe('SecurityQuestionPage', () => {
  let component: SecurityQuestionPage;
  let fixture: ComponentFixture<SecurityQuestionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityQuestionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
