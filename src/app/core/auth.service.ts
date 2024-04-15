import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { CookieService } from 'ngx-cookie-service';

// ================= only for demo purpose ===========
const DEMO_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTMxNjI2MjcsImV4cCI6MTc0NDY5ODYyNywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.e-9GYDcCvwau42VRzwkhdyRsjXhGfPV1pQqw-tFHUyk";

// const DEMO_USER: any = {
//   id: "5b700c45639d2c0c54b354ba",
//   username: "Watson Joyce",
//   roles: "SA",
// };
// ================= you will get those data from server =======

@Injectable()
export class AuthService {
  private baseUrl: string = environment.baseUrl + '/';

  private _isLoggedInSource = new BehaviorSubject(false);
  isLoggedIn = this._isLoggedInSource.asObservable();

  public onUserListChange: BehaviorSubject<any>;

  public userList: any = [];
  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private cookieService: CookieService
  ) {

    this.onUserListChange = new BehaviorSubject({});

    // if (this.ls.getItem(environment.appNameLst) && Object.keys(this.ls.getItem(environment.appNameLst)).length === 0) {
    //   this.userList = [];
    //   this.saveUser();
    // }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    this.cookieService.set(environment.appJwtTokenName, JSON.stringify(token))
  }

  get accessToken(): string {
    const cookieValue = this.cookieService.get(environment.appJwtTokenName);
    if (cookieValue == '' || cookieValue == undefined || cookieValue == null) {
      return ''
    }
    return JSON.parse(cookieValue);
  }

  getUser() {
    const cookieValue = this.cookieService.get(environment.appName);
    if (cookieValue == '' || cookieValue == undefined || cookieValue == null) {
      return ''
    }
    return JSON.parse(cookieValue);
  }

  setUser(user: any) {
    this.cookieService.set(environment.appName, JSON.stringify(user))
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signUp(regObj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      regObj.id = uuidv4();
      this._httpClient.post(`${this.baseUrl}posts`, regObj).subscribe({
        next: async (response: any) => {
          if (response && response != null && response.id > 0) {
            this.accessToken = DEMO_TOKEN;
            await this.setUser(response);
            this._isLoggedInSource.next(true);
          }
          //show error
          resolve(response);
        },
        error: err => {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  signIn(loginReqObj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.baseUrl}posts`).subscribe({
        next: async (response: any) => {
          if (response && response != null && response.length > 0) {
            let user = response.filter((x: any) => x.username == loginReqObj.username && x.password == loginReqObj.password)[0];
            if (user && user != null && user != undefined) {
              user.accessToken = DEMO_TOKEN;
              this.accessToken = DEMO_TOKEN;
              this.setUser(user);
              this._isLoggedInSource.next(true);
              resolve(user);
            }
            reject('"Please enter valid username and pasword"')
          }
          //show error
          reject("Something went wrong");
        },
        error: err => {
          console.log(err);
          reject(err);
        }
      });
    });
  }


  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check the access token availability
    if (!this.accessToken) {
      return of(false);
    }

    // // Check the access token expire date
    // if (AuthUtils.isTokenExpired(this.accessToken)) {
    //   return of(false);
    // }

    // If the access token exists and it didn't expire, Refresh it JwtToken
    // return this.RefreshJwtToken();//ideal check
    return of(true);
  }


  /**
   * Sign out
   */
  signOut(): Observable<any> {
    this.cookieService.delete(environment.appJwtTokenName);
    this.setUser(null);
    // Return the observable
    return of(true);
  }

}
