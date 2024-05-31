import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
// import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // store the URL so we can redirect after logging in
  redirectUrl: any;

  landlordStorageKey = 'handi-services-jwt';
  logoutKey = 'handi-services-logout-jwt';
  roleKey = 'role';

  signup$ = new BehaviorSubject<any>(null);
  email$ = new BehaviorSubject<any>(null);
  role!: string;

  private _reqType: any;
  private _reqTypeObs = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    // private socket: Socket
  ) { }

  setToken(data: any) {
    localStorage.setItem(this.landlordStorageKey, data?.token);
    localStorage.setItem(this.logoutKey, data.xUUIDToken);
  }

  get reqType() {
    return this._reqType;
  }

  set reqType(value) {
    this._reqType = value;
    this._reqTypeObs.next(value);
  }

  reqTypeObs() {
    return this._reqTypeObs.asObservable();
  }

  getToken(): string | any {
    return localStorage.getItem(this.landlordStorageKey);
  }
  getUUIDToken(): string | any {
    return localStorage.getItem(this.logoutKey);
  }

  getRole(): string | any {
    return localStorage.getItem(this.roleKey)
  }

  setRole(value: any) {
      localStorage.setItem(this.roleKey, JSON.stringify(value));
  }

  isLoggedIn() {
    // return this.getToken() !== null && this.getToken() !== undefined;
    return this.getToken() !== '' && this.getToken() !== null && this.getToken() !== 'null' && this.getToken() !== undefined && this.getToken() !== 'undefined';
  }

  logout(url?: string) {
    // localStorage.removeItem('askedUserForBvn');
    // this.socket.disconnect();

    localStorage.removeItem(this.landlordStorageKey);
    localStorage.removeItem(this.logoutKey);
    localStorage.removeItem('lastAction');
    localStorage.clear();
    this.redirectUrl = url;
    this.router.navigate(['/']);
    setTimeout(()=>{
      window.location.reload();
    },500)
    // console.log('Logging out >>>>>>');

    // document.location.reload();
  }

  sessionExpiredLogout(url?: string): void {
    localStorage.removeItem(this.landlordStorageKey);
    localStorage.removeItem(this.logoutKey);
    localStorage.removeItem('lastAction');
    localStorage.removeItem('session');
    localStorage.clear();
    // this.redirectUrl = url;

  }

  signUp() {
    return this.signup$.asObservable();
  }

  emailData() {
    return this.email$.asObservable();
  }
}
