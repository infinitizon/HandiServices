import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Router } from '@angular/router';
// import jwt_decode from 'jwt-decode';

import { StorageService } from './storage.service';
import { ApplicationContextService } from './application-context.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  token = '';

  constructor(
    private storageService: StorageService,
    private router: Router,
    private appCtx: ApplicationContextService
  ) {
    this.loadToken();
  }

  async loadToken() {
    const token = await this.storageService.get("token");
    if(token) {
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  logout(url?: string) {
    this.appCtx.userInformation$.next(null)
    this.storageService.remove('token');
    this.storageService.remove('role');
    this.storageService.remove('uuid');
    this.router.navigate([url??'/main/home']);
  }
}
