import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  AfterViewInit,
} from '@angular/core';
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subscription,
  timer,
} from 'rxjs';
import {
  debounceTime,
  switchMap,
  finalize,
  map,
  pairwise,
  filter,
  throttleTime,
} from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { IniDashboardService } from './ini-dashboard.service';
import * as moment from 'moment';
import { LogInComponent } from '@app/_shared/dialogs/log-in/log-in.component';
import { LogoutDialogComponent } from '@app/_shared/dialogs/logout-dialog/logout-dialog.component';
import { AuthService } from '@app/_shared/services/auth.service';
import { environment } from '@environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { data } from 'jquery';

@Component({
  selector: 'app-ini-dashboard',
  templateUrl: './ini-dashboard.component.html',
  styleUrls: ['./ini-dashboard.component.scss'],
})
export class IniDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav: any;
  @ViewChild(CdkVirtualScrollViewport) scroller!: CdkVirtualScrollViewport;

  sideNavMode: any = 'side';
  sideNavOpen = true;
  resizeObservable$!: Observable<Event>;
  sidenavSubscription$!: Subscription;
  sidenavClickSubscription$!: Subscription;
  isHome!: boolean;
  today = moment().format('MMMM DD, YYYY');
  isDialogOpen: boolean = false;
  userInformation: any;
  userSubscription$!: Subscription;
  referrals: any;
  role: any;

  keyword = 'product_title';
  searchData: any = [];


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private appContext: ApplicationContextService,
    private ngZone: NgZone,
    public dashboardService: IniDashboardService,
    private auth: AuthService,
    private clipboard: Clipboard,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.getUserInformation();
    }
    this.setupSideBar();
    this.sidenavFunction();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position=>{
        let coords: any =  {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        localStorage.setItem('coords', JSON.stringify(coords));

      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  copyReferral() {
    this.clipboard.copy(this.referrals);
  }

  getUserInformation() {
    this.userSubscription$ = this.http
      .get(`${environment.baseApiUrl}/users`)
      .subscribe(
        (response: any) => {
          this.appContext.userInformation$.next(response.data);
          if (response) {
            // console.log(`this.userInformation => `, this.userInformation);

            this.userInformation = response.data;
            this.referrals = this.userInformation?.refCode;
            this.role = this.userInformation?.Tenant[0].Roles[0].name;
            if (this.userInformation.firstLogin) {
            }
          }
        },
        (errResp) => {}
      );
  }


  ngAfterViewInit() {
    this.scroller
      ?.elementScrolled()
      .pipe(
        map(() => this.scroller.measureScrollOffset('bottom')),
        pairwise(),
        filter(([y1, y2]) => y2 < y1 && y2 < 140),
        throttleTime(200)
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          // this.fetchMore();
        });
      });

    const hasCollapsible = document.querySelectorAll('.has-collapsible');

    // Collapsible Menu
    hasCollapsible.forEach(function (collapsible) {
      collapsible.addEventListener('click', function () {
        collapsible.classList.toggle('active');

        // Close Other Collapsible
        hasCollapsible.forEach(function (otherCollapsible) {
          if (otherCollapsible !== collapsible) {
            otherCollapsible.classList.remove('active');
          }
        });
      });
    });
  }

  setupSideBar() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.sidenavSubscription$ = this.resizeObservable$
      .pipe(debounceTime(500))
      .subscribe((evt) => this.sidenavFunction());

    let button = document.querySelectorAll('.menu-section-bottom a');
    let sidenavClick$ = fromEvent(button, 'click');

    this.sidenavClickSubscription$ = sidenavClick$.subscribe((evt) => {
      if (window.innerWidth < 991) {
        this.sidenav.close();
      }
    });
  }

  sidenavFunction() {
    let browserWidth = window.innerWidth;
    if (browserWidth < 991) {
      this.sideNavMode = 'over';
      this.sideNavOpen = false;
    } else {
      this.sideNavMode = 'side';
      this.sideNavOpen = true;
    }
  }

  route(routeName: any) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([routeName]);
    } else {
      this.isDialogOpen = true;
      const loginDialog = this.dialog.open(LogInComponent, {
        data: {},
        width: '600px',
      });

      loginDialog.afterClosed().subscribe((result) => {
        if (result) {
        }
        this.isDialogOpen = false;
      });
    }
  }

  openLogOutDialog(): void {
    this.dialog.open(LogoutDialogComponent);
  }


  selectEvent(item) {
    this.router.navigate(['/app/home/view-checkout', item?.Tenant?.id, item?.Product.id, 'characteristics'])
    // do something with selected item
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
    this.http
    .get(`${environment.baseApiUrl}/products/search?q=${val}`)
    .subscribe(
      (response: any) => {
       this.searchData = response.data;
      },
      (errResp) => {}
    );
  }

  onFocused(e){
    // do something when input is focused
  }

  ngOnDestroy() {
    if (this.sidenavSubscription$) this.sidenavSubscription$.unsubscribe();
    if (this.sidenavClickSubscription$)
      this.sidenavClickSubscription$.unsubscribe();
      if (this.auth.isLoggedIn()) {
    this.userSubscription$.unsubscribe();
      }
  }
}
