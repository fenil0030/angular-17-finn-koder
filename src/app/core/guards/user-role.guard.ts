import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";
import { environment } from "../../../environments/environment";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private router: Router,
    private _authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (route.data && this._authService.getUser() && this._authService.getUser().roleType === environment.canEditOnly || (Number(route.params['id']) == 0)) {
      return true;
    } else {
      // this.snack.open(`Something went wrong`, 'OK', {
      //   duration: 4000,
      //   horizontalPosition: 'center',
      //   verticalPosition: 'bottom',
      // });
      this.router.navigate(['/']);
      return false;
    }
  }

}

