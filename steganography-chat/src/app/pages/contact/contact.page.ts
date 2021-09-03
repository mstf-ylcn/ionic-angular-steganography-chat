import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page'
import {PopOverService} from '../popoverService'
import {AddContactPage} from '../add-contact/add-contact.page'
import { AngularFireDatabase } from '@angular/fire/database';
import {userService} from '../userService'

import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { NativePageTransitions,NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  constructor(private modalCtrl:ModalController,
    private pop:PopoverController,
    private popService:PopOverService,
    private fireDb:AngularFireDatabase,
    private user:userService,
    private loadingController:LoadingController,
    private router:Router,
    private nav:NavController,
    private nativePageTransitions:NativePageTransitions) { }

    // userID;
  ngOnInit() {
     this.getContact();
    console.log("contact");
  }
  
  back()
  {
    let options:NativeTransitionOptions={
      direction:'right',
      duration:300,
    }
    this.nativePageTransitions.slide(options);
   this.nav.pop();
  }

 
  contactArray=[];
  tempArray=[];
  getContact()
  {
      this.fireDb.database.ref('contact/'+this.user.userArray.uid).on('value',data=>{
        this.contactArray=[];
        this.user.contactArray=[];
        this.tempArray=[];
        var counter=0;

    data.forEach(element => {
     this.tempArray.push(element.val().name);
      this.fireDb.database.ref('users/'+element.val().uid).once('value',data=>{
      this.contactArray.push(data.val());
      this.contactArray[counter].name=this.tempArray[counter];
      this.user.contactArray.push(this.contactArray[counter]);
      counter++;
    })
    });
     })
  }

  deleteContact(deleteId)
  {
     this.present();
     this.fireDb.object('contact/'+this.user.userArray.uid+'/'+deleteId).remove();
  }


  async presentPopover(ev: any) {
    this.popService.pageControl=1;
    const popover = await this.pop.create({
      component: PopoverPage,
      cssClass: 'homepop_css',
      event: ev,
      translucent: true,
      showBackdrop:false,
    });
    await popover.present();
  }

  
  search(ev)
  {
    this.contactArray=this.user.contactArray;
    console.log(this.contactArray);
    const val=ev.target.value;
    if(val && val.trim() !='')
    {
      this.contactArray=this.contactArray.filter((item)=>{
        return (item.email.toLowerCase().indexOf(val.toLowerCase())>-1);
      })
    }
  }

  chatPage(uid,name)
  {
    this.user.chatUId=uid;
    this.user.contactName=name;
    // this.nav.pop();
    // this.nav.navigateBack('home', { animated: false });
    //  this.nav.pop();
    let options:NativeTransitionOptions={
      direction:'left',
      duration:300,
    }
    this.nativePageTransitions.slide(options);
      this.router.navigateByUrl('/chat');
   
  }

  control=0;
  cancel()
  {
    setTimeout(() => {
    this.control=0;
    }, 250);
  }
  
  searchFocus()
  {
    this.control=1;
  }

  async addContact()
  {
    const modal = await this.modalCtrl.create({
      component: AddContactPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async present() {
    const loading = await this.loadingController.create({
      cssClass: 'transparent',
      backdropDismiss: true,
      duration:100
    });
    await loading.present();
  }
  
}
