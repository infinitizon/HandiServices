import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PMTGatewayComponent } from './gateway.component';

describe('PMTGatewayComponent', () => {
  let component: PMTGatewayComponent;
  let fixture: ComponentFixture<PMTGatewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PMTGatewayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PMTGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
