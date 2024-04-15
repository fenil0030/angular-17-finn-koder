import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
// import { AuthService } from './auth.service';
import { AuthUtils } from './auth.utils';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private _authService: AuthService, private router: Router) {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();
        if (this._authService.accessToken == null || this._authService.accessToken === 'null') {
            this._authService.signOut();
            location.reload();
        }
        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if (this._authService.accessToken && !AuthUtils.isTokenExpired(this._authService.accessToken)) {

            // newReq = req.clone({
            //     headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
            // });
            newReq = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this._authService.accessToken}`
                },
            });
        }

        // Response
        return next.handle(newReq).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        if (event.status == 401) {
                            alert('Unauthorize access!!!');
                            // Sign out
                            this._authService.signOut();

                            // Reload the app
                            this.router.navigateByUrl('/').then(() => {
                                this.router.navigated = false;
                                this.router.navigate([this.router.url]);
                            });
                        }
                    }
                    return event;
                },
                error: (error) => {
                    if (error.status == 401) {
                        alert('Unauthorize access!!!')
                    }
                    if (error.status == 404) {
                        alert('Page Not Found!!!')
                    }
                }

            }
            )
        );
    }
}
