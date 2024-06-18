import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NokPage } from './nok.page';

describe('NokPage', () => {
  let component: NokPage;
  let fixture: ComponentFixture<NokPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NokPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
