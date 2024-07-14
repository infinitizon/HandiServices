import { Inject, Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map, switchMap} from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '@environments/environment';
import { StorageService } from '../services/storage.service';
import { Observable, combineLatest, from, of } from 'rxjs';
import { ApplicationContextService } from '../services/application-context.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private storageService: StorageService,
    private appCtx: ApplicationContextService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    return of({})// from(this.storageService.get('token'))
          .pipe(
            switchMap(()=> {
              return this.appCtx.userRole$;
            }),
            switchMap((role) =>{
              return combineLatest([
                from(this.storageService.get('token')),
                from(of(role)),
                from(this.storageService.get('uuid')),
              ])
            }),
            switchMap(([token, role, uuid, ]) => {
              console.log(role);

                if (token) {
                      const getUrl = new URL(request.url);
                      request = request.clone({
                        setHeaders: {
                          Authorization: 'Bearer ' + token,
                          "x-uuid-token": uuid,
                          "role": role ?? 'CUSTOMER'
                        },
                      });
                }
                // if (!request.headers.has('Content-Type')) {
                //     request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
                // }
                // if (this.debug) {
                //     request = request.clone({ url: this.url + request.url + '?XDEBUG_SESSION_START=1'});
                // }

                return next.handle(request).pipe(
                    map((event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            // do nothing for now
                        }
                        return event;
                    }),
                    catchError((error: HttpErrorResponse) => {
                        if ([401, 411].includes(error.status)) {
                          this.auth.logout();
                        }
                        throw error;
                    })
                );

            })
        );
  }
}
