import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PMTCompleteComponent } from './complete.component';

describe('PMTCompleteComponent', () => {
  let component: PMTCompleteComponent;
  let fixture: ComponentFixture<PMTCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PMTCompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PMTCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
