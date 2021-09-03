import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides, LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import {userService} from '../userService'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireAuth,  } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.page.html',
  styleUrls: ['./photo-viewer.page.scss'],
})

export class PhotoViewerPage implements OnInit {
  @Input()test: string;
  @ViewChild(IonSlides, {static: false})slider: IonSlides;
  constructor(private modal:ModalController,
    private navparams:NavParams,
    private user:userService,
    private sanitizer:DomSanitizer,
    private loadingController:LoadingController,
    private storage:AngularFireStorage,
    private fireDb:AngularFireDatabase,
    private toastController:ToastController) { 
  this.userControl=this.navparams.get('userControl');

  console.log(this.userControl);
    }
  ngOnInit() {
  }

  sliderOpts={
    zoom:{
      maxRation:2,
      maxRatio:5,// ????,
    }
  };
 
  //https://stackoverflow.com/questions/62928681/zoom-on-ion-slide-not-properly-working-ionic-6
  ionViewDidEnter(){
    this.slider.update();
  }

  async zoomEnd(zoomslides:IonSlides)
  {
  
   const slider= await zoomslides.getSwiper();
   const zoom=slider.zoom;
   zoom.out();

  }

  back()
  {
    this.modal.dismiss();

  }
  userControl;



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
       this.user.newPp= (res.dataUrl);
     
       this.userControl=2;
  
    }).catch(e=>{
  
  
    })
  }
 
  ppUrl;
  uploadImage()
  {
    this.ppUrl=this.dataUrltoBlob(this.user.newPp);
    this.present();

   var date=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
    var upload= this.storage.upload("profilPic/"+`${this.user.userArray.uid}/`+`${this.user.userArray.email}_${date}.jpg`,this.ppUrl);
    upload.then(res=>{
      res.task.snapshot.ref.getDownloadURL().then(downloadableUrl=>{
        this.ppUrl=downloadableUrl;
        this.fireDb.database.ref('users/'+this.user.userArray.uid).update({
          pp:this.ppUrl
        }).then(()=>{
          this.dismiss();
          this.presentToast();


        })
      })
    })
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: `Your profile photo has been updated.`,
      duration: 1500,
      position: 'top',
      cssClass: 'toast'
    });
    toast.present();
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

isLoading;
async present() {
  this.isLoading = true;
  return await this.loadingController.create({
    cssClass: 'transparent',
    backdropDismiss: true,
  }).then(a => {
    a.present().then(() => {
      if (!this.isLoading) {
        a.dismiss().then();
      }
    });
  });
}

async dismiss() {
  this.isLoading = false;
  return await this.loadingController.dismiss().then();
}




}
