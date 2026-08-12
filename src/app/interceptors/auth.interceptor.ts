import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpInterceptor,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LocalService } from '../services/storage/local.service';
import { environment } from '../../environments/environments';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private localStorageService: LocalService,
        private toastr: ToastrService
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        const user = this.localStorageService.getJsonValue(
            environment.typeDouble
        );

        // APIs that don't require authentication
        const excludedUrls = [
            `${environment.apiURL}companylogin/`,
            `${environment.apiURL}sync/lastsync`,
            `${environment.apiURL}sync/manual`,
            `${environment.apiURL}check-user-password-updated`
        ];

        const isExcluded = excludedUrls.includes(request.url);

        // Add authentication headers
        if (user?.id && !isExcluded) {

            request = request.clone({
                setHeaders: {
                    Authorization: user.id.toString(),
                    'x-access-token': localStorage.getItem('access_token') || ''
                }
            });

        }

        return next.handle(request).pipe(

            catchError((error: HttpErrorResponse) => {

                if (error.status === 401) {

                    // Permission error from backend
                    if (
                        error.error?.message === "You Don't Have Permission"
                    ) {

                        this.toastr.error(error.error.message);

                    } else {

                        // Session expired
                        localStorage.clear();

                        this.toastr.error(
                            'Session Timeout: The system performed an auto log-out.'
                        );

                        this.router.navigate(['/login']);
                    }
                }

                return throwError(() => error);
            })

        );
    }
}