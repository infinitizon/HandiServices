import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PMTWebviewComponent } from './webview.component'

describe('PMTWebviewComponent', () => {
  let component: PMTWebviewComponent;
  let fixture: ComponentFixture<PMTWebviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PMTWebviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PMTWebviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
