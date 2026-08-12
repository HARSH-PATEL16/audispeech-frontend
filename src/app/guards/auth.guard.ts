import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateChild,
    Router,
    RouterStateSnapshot
} from '@angular/router';

import { LocalService } from '../services/storage/local.service';
import { environment } from '../../environments/environments';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {

    constructor(
        private router: Router,
        private localStorageService: LocalService
    ) { }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {

        const user = this.localStorageService.getJsonValue(
            environment.typeDouble
        );

        // User is logged in
        if (user?.id) {
            return true;
        }

        // User is not logged in
        this.router.navigate(['/login']);

        return false;
    }
}