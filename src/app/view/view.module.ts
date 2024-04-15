import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ViewRoutingModule } from './view-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ViewRoutingModule
  ],
  providers: [
    DatePipe
  ],
  declarations: [
    HomeComponent,
    ProfileComponent
  ]
})
export class ViewModule { }
