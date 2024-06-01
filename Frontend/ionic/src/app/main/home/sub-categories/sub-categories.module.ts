import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from '@app/_shared/shared.module';
import { SubCategoriesPageRoutingModule } from './sub-categories-routing.module';

import { SubCategoriesPage } from './sub-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SubCategoriesPageRoutingModule
  ],
  declarations: [SubCategoriesPage]
})
export class SubCategoriesPageModule {}
