import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubCategoryPageRoutingModule } from './sub-category-routing.module';

import { SubCategoryPage } from './sub-category.page';
import { SharedModule } from '@app/_shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubCategoryPageRoutingModule,
    SharedModule,
  ],
  declarations: [SubCategoryPage]
})
export class SubCategoryPageModule {}
