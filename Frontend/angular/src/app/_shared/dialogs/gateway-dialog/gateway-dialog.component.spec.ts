import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayDialogComponent } from './gateway-dialog.component';

describe('FundWalletDialogComponent', () => {
  let component: GatewayDialogComponent;
  let fixture: ComponentFixture<GatewayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GatewayDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
