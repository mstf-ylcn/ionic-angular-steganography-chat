import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhotoViewerPage } from './photo-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: PhotoViewerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotoViewerPageRoutingModule {}
