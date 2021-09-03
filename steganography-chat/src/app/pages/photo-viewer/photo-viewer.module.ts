import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhotoViewerPageRoutingModule } from './photo-viewer-routing.module';

import { PhotoViewerPage } from './photo-viewer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhotoViewerPageRoutingModule
  ],
  declarations: [PhotoViewerPage]
})
export class PhotoViewerPageModule {}
