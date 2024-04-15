import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(private authService: AuthService, private router: Router
  ) { }

  ngOnInit(): void {

  }

  onSubmit(): void {

    this.authService.signIn(this.form).then(async (obj) => {
      this.router.navigate(['/view/home']);
      this.isLoginFailed = false;
      this.isLoggedIn = true;
    }, (err: any) => {
      this.errorMessage = err;
      this.isLoginFailed = true;
    })
  }

}
