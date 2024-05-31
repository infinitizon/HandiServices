/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IniDashboardService } from './ini-dashboard.service';

describe('Service: IniDashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IniDashboardService]
    });
  });

  it('should ...', inject([IniDashboardService], (service: IniDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
