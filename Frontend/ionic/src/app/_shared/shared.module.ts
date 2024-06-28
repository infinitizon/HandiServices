import { CUSTOM_ELEMENTS_SCHEMA, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgOtpInputModule } from 'ng-otp-input';
import { environment } from '@environments/environment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.SOCKET_BASE, options: {} };
// Pipes
import { ColorPipe, ImagePipe } from './pipes/random-color.pipe';
// Components
import { ImgPickerComponent } from './components/picker/img-picker/img-picker.component';
import { HeaderComponent } from './components/header/header.component';
import { OTPComponent } from './components/otp/otp.component';
import { SearchComponent } from './components/search/search.component';
import { PMTGatewayComponent } from './components/payment/gateway/gateway.component';
import { PMTCompleteComponent } from './components/payment/complete/complete.component';
import { PMTWebviewComponent } from './components/payment/webview/webview.component';
import { NumberKeyboardComponent } from './components/number-keyboard/number-keyboard.component';

@NgModule({
  declarations: [
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
    OTPComponent,
    SearchComponent,
    PMTGatewayComponent, PMTCompleteComponent, PMTWebviewComponent,
    NumberKeyboardComponent,
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
    SocketIoModule.forRoot(config),
  ],
  exports: [
    CommonModule, HttpClientModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,
    NgOtpInputModule,
    SocketIoModule,
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
    OTPComponent,
    SearchComponent,
    PMTGatewayComponent, PMTCompleteComponent, PMTWebviewComponent,
    NumberKeyboardComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
