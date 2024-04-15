import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { UserRoleGuard } from './guards/user-role.guard';
import { AuthService } from './auth.service';

@NgModule({
    imports: [
    ],
    providers: [
        AuthService,
        UserRoleGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ]
})
export class AuthModule {
}
