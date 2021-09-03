import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SteganographyPage } from './steganography.page';

const routes: Routes = [
  {
    path: '',
    component: SteganographyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SteganographyPageRoutingModule {}
