import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
// Pipes
import { ColorPipe, ImagePipe } from './pipes/random-color.pipe';
// Components
import { ImgPickerComponent } from './components/picker/img-picker/img-picker.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
  ],
  providers: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    ColorPipe,
    ImagePipe,
    ImgPickerComponent,
    HeaderComponent,
  ]
})
export class SharedModule { }
