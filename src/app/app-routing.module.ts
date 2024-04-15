import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/noAuth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('../app/authentication/authentication.module').then(m => m.AuthenticationModule),
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
  },
  {
    path: 'view',
    loadChildren: () => import('../app/view/view.module').then(m => m.ViewModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
  },
  { path: '**', redirectTo: 'view/home', pathMatch: 'full' },
  { path: '', redirectTo: 'view/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
