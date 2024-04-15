import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LocalStoreService } from './local-store.service';
import { AuthUtils } from './auth.utils';

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
  private baseUrl: string = environment.baseUrl + '/api/';
  private accessUrl: string = environment.accessUrl;

  private _isLoggedInSource = new BehaviorSubject(false);
  isLoggedIn = this._isLoggedInSource.asObservable();

  public onUserListChange: BehaviorSubject<any>;

  public userList: any = [];
  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private ls: LocalStoreService
  ) {

    this.onUserListChange = new BehaviorSubject({});

    if (this.ls.getItem(environment.appNameLst) && Object.keys(this.ls.getItem(environment.appNameLst)).length === 0) {
      this.userList = [];
      this.saveUser();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem(environment.appJwtTokenName, token);
  }

  get accessToken(): string {
    return localStorage.getItem(environment.appJwtTokenName) ?? '';
  }

  getUser() {
    const value = window.localStorage.getItem(environment.appName);
    try {
      return JSON.parse(value!);
    } catch (e) {
      return null;
    }
  }

  setUser(user: any) {
    let value = JSON.stringify(user);
    window.localStorage.setItem(environment.appName, value);
    return true;
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------


  getUserList(): void {
    this.userList = this.ls.getItem(environment.appNameLst) ?? [];
    this.onUserListChange.next(this.userList);
  }

  addToUser(addedItem: any) {
    this.userList.push(addedItem);
    this.saveUser();
  }

  saveUser(): void {
    this.ls.setItem(environment.appNameLst, this.userList);
    this.getUserList();
  }


  signUp(regObj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getUserList();
      let user = this.userList.filter((x) => x.username == regObj.username && x.password == regObj.password)[0];
      if (!user || user == null || user == undefined) {
        this.addToUser(regObj);
        this._isLoggedInSource.next(true);
        resolve(user);
      }
      reject('User is already exsit');
    });
  }

  signIn(loginReqObj: any): Promise<any> {

    return new Promise((resolve, reject) => {
      this.getUserList();
      let user = this.userList.filter((x) => x.username == loginReqObj.username && x.password == loginReqObj.password)[0];
      if (user && user != null && user != undefined) {
        user.accessToken = DEMO_TOKEN;
        this.accessToken = DEMO_TOKEN;
        this.setUser(user);
        this._isLoggedInSource.next(true);
        resolve(user);
      }
      reject('"Please enter valid username and pasword"')
    });

    //FOLLOWING CODE SENDS SIGNIN REQUEST TO SERVER
    // return new Promise((resolve, reject) => {
    //   this._httpClient.post(`${this.baseUrl}Account/SignIn`, loginReqObj).subscribe({
    //     next: async (response: any) => {
    //       if (response && Boolean(response.meta["status"])) {
    //         // this.setUserRights(response.webRights);
    //         this.accessToken = response.result.token;
    //         await this.setUser(response.result);
    //         // return of(response);
    //       }
    //       //show error
    //       resolve(response);
    //     },
    //     error: err => {
    //       console.log(err);
    //       this.handleError(err)
    //       reject(err);
    //     }
    //   });
    // });
  }


  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check the access token availability
    if (!this.accessToken) {
      return of(false);
    }

    // Check the access token expire date
    if (AuthUtils.isTokenExpired(this.accessToken)) {
      return of(false);
    }

    // If the access token exists and it didn't expire, Refresh it JwtToken
    // return this.RefreshJwtToken();//ideal check
    return of(true);
  }


  /**
   * Sign out
   */
  signOut(): Observable<any> {
    // Remove the access token from the local storage
    localStorage.removeItem(environment.appJwtTokenName);
    this.setUser(null);
    // Return the observable
    return of(true);
  }

}
