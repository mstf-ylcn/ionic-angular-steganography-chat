import { Component, OnInit } from '@angular/core';
import { NavController,LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { AngularFireAuth,  } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import {userService} from '../userService'
import { Router } from '@angular/router';
@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
})
export class SingupPage implements OnInit {

  constructor(private nav:NavController,
    private sanitizer:DomSanitizer,
    private auth:AngularFireAuth,
    private fireDb:AngularFireDatabase,
    private storage:AngularFireStorage,
    private loadingController:LoadingController,
    private router:Router,
    private user:userService) {
   }

  ngOnInit() {
    this.validator();
    var a=this.fireDb.createPushId();
    console.log(a);

  }

  form : FormGroup;
    data:any;

    validator(){
      this.form = new FormGroup({
        name: new FormControl(null,{validators:[Validators.required,Validators.minLength(2),Validators.pattern('[a-zA-Z şŞ iİ]*')]}),
        policy: new FormControl(null,{validators:[Validators.requiredTrue]}),
        password: new FormControl(null,{validators:[Validators.required,Validators.minLength(6)]}),
        email: new FormControl(null,{validators:[Validators.required,Validators. pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")]}),
      });
    }

    get name()
    {
      return this.form.get('name');
    }

    get policy()
    {
      return this.form.get('policy');
    }
    get password()
    {
      return this.form.get('password');
    }
    get email()
    {
      return this.form.get('email');
    }

    next()
    {
      if(!this.form.valid)
      {
        this.form.markAllAsTouched();
        console.log("Error");
    }
    else
    {
      if(this.userControl==0)
      {

    this.page=0;
    this.data=this.form.getRawValue();
        console.log("Next page");
        console.log(this.data);
      }
      }
    }


  page=1;
  back()
  {
    this.nav.back();
  }
  // back2(){
  //   this.page=1;
  // }



  password_type="password";
  show = false;
  hide=1;
  show_pw1()
  {
   if(this.show){
     this.password_type="text";
     this.show=false;
     this.hide=0;
   } 
   else
   {
    this.show=true;
     this.password_type="password";
     this.hide=1;

   }
  }

async getCamera()
{
  const image= await Camera.getPhoto({
    quality:100,
    allowEditing:false,
    resultType:CameraResultType.DataUrl,
    source:CameraSource.Camera,
    saveToGallery:true,
    preserveAspectRatio:true,
    width:1080,
    height:1080,
  }).then(res=>{
    this.ppUrl= this.sanitizer.bypassSecurityTrustResourceUrl(res && (res.dataUrl));
    this.uploadImg=this.dataUrltoBlob(res.dataUrl);
    this.uploadImage();
  }).catch(e=>{
    alert(e);
  })
}
async getGallery()
{
  const image= await Camera.getPhoto({
    quality:100,
    allowEditing:false,
    resultType:CameraResultType.DataUrl,
    source:CameraSource.Photos,
    saveToGallery:true,
    preserveAspectRatio:true,
    width:1080,
    height:1080,
  }).then(res=>{
    this.ppUrl= this.sanitizer.bypassSecurityTrustResourceUrl(res && (res.dataUrl));
    this.uploadImg=this.dataUrltoBlob(res.dataUrl);
    this.uploadImage();

  }).catch(e=>{
    alert(e);
  })

}
time;
ppUrl:SafeResourceUrl="../../../assets/pp.jpg";


uploadImage()
{
 this.time=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
  console.log(this.time);
  var upload= this.storage.upload("profilPic/"+`${this.data.email}_${this.time}.jpg`,this.uploadImg);
  upload.then(res=>{
    res.task.snapshot.ref.getDownloadURL().then(downloadableUrl=>{
      this.ppUrl=downloadableUrl;
    })
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

uploadImg;


userControl=0
inputFocus=0;
mailControl(ev) {
  this.inputFocus=1;
  if(ev.target.value=='')
  {
    this.inputFocus=0;
    this.userControl=0;
  }
   this.fireDb.database.ref().child("users").orderByChild("email").equalTo(`${ev.target.value}`).once("value",snapshot => {
    if (snapshot.exists()){
      this.userControl=1;
    }
    else
    {
      this.userControl=0;
    }
});
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

singup(){
  this.present();
  this.auth.createUserWithEmailAndPassword(this.data.email,this.data.password).then(res=>{
   this.fireDb.object('users/'+res.user.uid).set({
     uid:res.user.uid,
     name:this.data.name,
     email:this.data.email,
     pp:this.ppUrl,
     about:"Hey, I'm"+` ${this.data.name}`,
     aboutDate:(new Date().toISOString().slice(0, 10)),
     status:'Online',
   })
   this.fireDb.database.ref().child("users/").child(`/${res.user.uid}`).on('value',data=>{
    this.user.userArray=data.val();
    })
  }).then(res=>{
    this.mailWrite(this.data.email);
    this.dismiss();
    this.router.navigateByUrl('/home');
    this.form.reset();
  }).catch(err=>{
    this.dismiss();
    alert(err);
  })
  
}

async mailWrite(data){
  await Filesystem.writeFile({
    path: 'mail',
    data: `${data}`,
    directory: Directory.External,
    encoding: Encoding.UTF8,
    recursive: true
  }).then((data)=>{
  }).catch((err)=>{
  });
};

}

// var promise =new Promise((resolve,reject)=>{
//   this.fireDb.database.ref().child("users/").child(`/${res.user.uid}`).on('value',data=>{
//     resolve(data.val())
//    this.user.userArray=data.val();
//    })
//  }).then(res=>{
//    this.dismiss();
//    this.router.navigateByUrl('/home');
//  }).catch(err=>{
//    alert(err);
//  })
// })