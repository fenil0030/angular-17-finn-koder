import { Component } from '@angular/core';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;
  username?: string;

  constructor(private _authService: AuthService
  ) { }

  ngOnInit(): void {
    let user = {} as any;
    this._authService.isLoggedIn.subscribe(res => {
      user = this._authService.accessToken ? this._authService.getUser() : null;
      this.isLoggedIn = (user && user != null && user != undefined) ? true : false;

      if (this.isLoggedIn) {
        this.username = user.username;
      }
    });
  }

  logout(): void {
    this._authService.signOut().subscribe((res) => {
      // this._router.navigate(['login']);
      window.location.reload();
    });
  }


}
