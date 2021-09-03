import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactProfilePage } from './contact-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ContactProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactProfilePageRoutingModule {}
