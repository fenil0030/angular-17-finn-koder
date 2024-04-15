import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: any = {
    username: null,
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  isRegIn = false;
  roles: string[] = [];
  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    this.authService.signUp(this.form).then(async (obj) => {
      this.router.navigate(['/view/home']);
      this.isSignUpFailed = false;
      this.isRegIn = true;
    }, (err: any) => {
      this.errorMessage = err;
      this.isSignUpFailed = true;
    })
  }
}
