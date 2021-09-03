import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SteganographyPageRoutingModule } from './steganography-routing.module';

import { SteganographyPage } from './steganography.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SteganographyPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SteganographyPage]
})
export class SteganographyPageModule {}
