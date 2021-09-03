import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import {PhotoViewerPage} from '../photo-viewer/photo-viewer.page'
import {userService} from '../userService'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  constructor(private nav:NavController,
    private router:Router,
    private _modal:ModalController,
    private user:userService,
    private fireDb:AngularFireDatabase,
    private storage:AngularFireStorage,
    private sanitizer:DomSanitizer,
    private toastController:ToastController) {
      console.log("edit profile");
      this.validator();
      this.form.setValue({name:this.user.userArray.name,about:this.user.userArray.about})
     }

  ngOnInit() {
  }

  back()
  {
    this._modal.dismiss();
  }
  
  control=false;

  updateControl()
  {
    console.log("update control");
    this.control=true;
  }

  cancel()
  {
    this.form.setValue({name:this.user.userArray.name,about:this.user.userArray.about})
    this.control=false;
  }

  update()
  {
    if(!this.form.valid)
    {
      this.form.markAllAsTouched();
    }
    else
    {
    this.data=this.form.getRawValue();
    if(this.data.name!=this.user.userArray.name && this.user.userArray.about!=this.data.about)
    {
      this.fireDb.object('users/'+this.user.userArray.uid).update({
        name:this.data.name,
        about:this.data.about,
        aboutDate:(new Date().toISOString().slice(0, 10))
      })
    }
    else if(this.user.userArray.about!=this.data.about)
    {
      this.fireDb.object('users/'+this.user.userArray.uid).update({
        about:this.data.about,
        aboutDate:(new Date().toISOString().slice(0, 10))
      })
    }
    else
    {
      this.fireDb.object('users/'+this.user.userArray.uid).update({
        name:this.data.name,
     })
    }
    }
    this.presentToast();
    this.control=false;

  }
  
  async presentToast() {
    const toast = await this.toastController.create({
      message: `Your profile has been updated.`,
      duration: 1500,
      position: 'top',
      cssClass: 'toast'
    });
    toast.present();
  }




  photoViewer()
  {
    this.userControl=0;
    this.editProfile();
  }

  async editProfile()
  {
    const modal = await this._modal.create({
      component: PhotoViewerPage,
      cssClass: 'my-custom-class',
      componentProps: { userControl: this.userControl}
    });
    return await modal.present();
  }

 ppUrl;
 userControl;
 imageControl=0;
  async getCamera()
{

  const image= await Camera.getPhoto({
    quality:50,
    allowEditing:false,
    resultType:CameraResultType.DataUrl,
    source:CameraSource.Prompt,
    saveToGallery:true,
    preserveAspectRatio:true,
    correctOrientation:true,
  }).then(res=>{

     this.user.newPp=(res.dataUrl);
     this.userControl=2;
     this.editProfile();

  }).catch(e=>{


  })
}
dataUrltoBlob(dataURL)
{
let binary=atob(dataURL.split(',')[1]);
let array=[];

 for (let index = 0; index < binary.length; index++) {
 array.push(binary.charCodeAt(index));
 }
 return new Blob([new Uint8Array(array)],{type:'image/jpeg'});
}



form : FormGroup;
data:any;

validator(){
  this.form = new FormGroup({
    name: new FormControl(null,{validators:[Validators.required,Validators.minLength(2),Validators.pattern('[a-zA-Z şŞ iİ]*')]}),
    about: new FormControl(null,{validators:[Validators.required,Validators.minLength(1)]}),
  });
}

get name()
{
  return this.form.get('name');
}

get about()
{
  return this.form.get('about');
}




}
