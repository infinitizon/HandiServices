import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';
const MINUTES_UNITL_AUTO_LOGOUT = 10; // in mins
const CHECK_INTERVAL = 15000; // in ms
const STORE_KEY = 'lastAction';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  constructor(
    private router: Router,
    private authService: AuthService,
    private commonService: CommonService,
  ) {
    this.check();
    this.initListener();
    this.initInterval();
    localStorage.setItem(STORE_KEY, Date.now().toString());
  }

  public getLastAction(): string | any {
    return localStorage.getItem(STORE_KEY);
  }
  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }
  initListener() {
    document.body.addEventListener('click', () => this.reset());
    document.body.addEventListener('mouseover', () => this.reset());
    document.body.addEventListener('mouseout', () => this.reset());
    document.body.addEventListener('keydown', () => this.reset());
    document.body.addEventListener('keyup', () => this.reset());
    document.body.addEventListener('keypress', () => this.reset());
  }

  reset() {
    this.setLastAction(Date.now());
  }

  initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  check() {
    const now = Date.now();
    const timeleft =
      parseInt(this.getLastAction()) + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;

    if (
      isTimeout &&
      !localStorage.getItem('rememberMe') &&
      localStorage.getItem('HandiServices-invest-jwt') &&
      localStorage.getItem('session') !== 'true'
    ) {
      // this.commonService.dialog.closeAll();
      this.openMessageDialog({
        title: 'Session Expired',
        acceptButtonText: 'Login',
        cancelButtonText: 'Ok',
        message: 'Your session has expired! Please login to continue.',
      });
      localStorage.removeItem(STORE_KEY);
      // this.commonService.dialog.closeAll();
      this.authService.sessionExpiredLogout();
      this.router.navigate(['/']);

    }
  }

  openMessageDialog1(
    data: {
      // image?: string;
      title: string;
      acceptButtonText?: string;
      cancelButtonText?: string;
      message: string;
    }

    // callBack?: () => void
  ): void {
    localStorage.setItem('session', 'true');
    // const messageDialog = this.dialog.open(SessionExpiredComponent, { data, width: '500px', maxWidth: '90%', });
    // messageDialog.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.commonService.dialog.closeAll();
    //   } else {
    //     localStorage.removeItem(STORE_KEY);
    //     this.commonService.dialog.closeAll();
    //     this.authService.sessionExpiredLogout();
    //     this.router.navigate(['/']);
    //     document.location.reload();
    //   }
    // });
  }

  openMessageDialog(
    data: {
      // image?: string;
      title: string;
      acceptButtonText?: string;
      cancelButtonText?: string;
      message: string;
    }

    // callBack?: () => void
  ): void {
    localStorage.setItem('session', 'true');
    // const messageDialog = this.dialog.open(SessionExpiredComponent, { data, width: '500px', height: '180px' });
    // messageDialog.afterClosed().subscribe((result) => {
    // });
  }
}
