import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import {EditProfilePage} from '../edit-profile/edit-profile.page'
import {AccountSettingsPage} from '../account-settings/account-settings.page'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { userService } from '../userService';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private nav:NavController,
    private router:Router,
    private afs:AngularFireAuth,
    private modal:ModalController,
    private user:userService,
    private nativePageTransitions:NativePageTransitions) {
      console.log("settings");
     }

  ngOnInit() {
    if(this.user.theme=='dark')
    {
      this.check="true";
      this.mode=0;
    }
    else
    {
      this.check="false";
      this.mode=1;

    }
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


  async editProfile() {
    const modal = await this.modal.create({
      component: EditProfilePage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  logOut(){
   this.afs.signOut();
   this.router.navigateByUrl('/login')
  }

  mode=1;
  check="false"
  darkmode(event)
  {
    if(this.mode==1)
    {
      document.body.setAttribute('color-theme','dark'); 
      this.mode=0;
      this.themeWrite('dark');
      this.check="true"
    }
    else
    {
      document.body.setAttribute('color-theme','light'); 
      this.mode=1;
      this.themeWrite('light');
      this.check="false"
    }
  }

  async accountSettings() {
    const modal = await this.modal.create({
      component: AccountSettingsPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async themeWrite(data){
    await Filesystem.writeFile({
      path: 'theme',
      data: `${data}`,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      recursive: true
    }).then((data)=>{
    }).catch((err)=>{
    });
  };
  

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //  async  readTheme   ()  {
  //   const contents = await Filesystem.readFile({
  //     path: 'theme',
  //     directory: Directory.External,
  //     encoding: Encoding.UTF8,
  //   }).then((data)=>{
   
  //     this.darkmode(data.data);
 
  //   }).catch((err)=>{
  //   });
  // };

  



}
