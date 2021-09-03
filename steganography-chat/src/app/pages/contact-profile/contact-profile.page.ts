import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import {PhotoViewerPage} from '../photo-viewer/photo-viewer.page'
import { AngularFireDatabase } from '@angular/fire/database';
import {userService} from '../userService'


import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-contact-profile',
  templateUrl: './contact-profile.page.html',
  styleUrls: ['./contact-profile.page.scss'],
})
export class ContactProfilePage implements OnInit {

  constructor(private nav:NavController,
    private modal:ModalController,
    private modal2:ModalController,
    private user:userService,
    private fireDb:AngularFireDatabase) { 
      console.log("contact");
    }

  ngOnInit() {
    this.getContactUser();
  }
  back()
  {
this.modal.dismiss();
// this.nav.pop();
  }

 async photoViewer()
  {
    const modal = await this.modal2.create({
      component: PhotoViewerPage,
      cssClass: 'my-custom-class',
      componentProps:{userControl:1}
    });
    return await modal.present();
  }
 
  
  // contactUserData;
  getContactUser()
  {
    this.fireDb.database.ref('users/'+this.user.chatUId).once('value',data=>{
     this.user.contactUserData=data.val();
    //  this.user.contactUserData.name=this.user.contactName;
    })
  }



}
