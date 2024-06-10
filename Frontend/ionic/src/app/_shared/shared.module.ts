import { CUSTOM_ELEMENTS_SCHEMA, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgOtpInputModule } from 'ng-otp-input';
// Pipes
import { ColorPipe, ImagePipe } from './pipes/random-color.pipe';
// Components
import { ImgPickerComponent } from './components/picker/img-picker/img-picker.component';
import { HeaderComponent } from './components/header/header.component';
import { OTPComponent } from './components/otp/otp.component';

@NgModule({
  declarations: [
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
    OTPComponent,
  ],
  providers: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HttpClientModule,
    FormsModule, ReactiveFormsModule,
    NgOtpInputModule,
  ],
  exports: [
    CommonModule, HttpClientModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,
    NgOtpInputModule,
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
    OTPComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
