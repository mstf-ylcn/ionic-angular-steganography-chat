import { Component, NgZone, OnInit,  } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {userService} from '../userService'
import { Router } from '@angular/router';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { NativePageTransitions,NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private router:Router,
    private afAuth:AngularFireAuth,
    private fireDb:AngularFireDatabase,
    private user:userService,
    private loadingController:LoadingController,
    private toastController:ToastController,
    private ngZone: NgZone,
    private platform:Platform,
    private modal:ModalController,
    private nav:NavController,
    private nativePageTransitions:NativePageTransitions
    ) { }

  ngOnInit() {
    this.readTheme();
    this.readMail();
    this.validator();
    this.exit();

  }
 
  counter=0;
  exit()
  {
  this.platform.backButton.subscribeWithPriority(10, () => {
    this.counter++;
    if(this.router['routerState'].snapshot.url!='/home')
    {
      let options:NativeTransitionOptions={
        direction:'right',
        duration:300,
      }
      this.nativePageTransitions.slide(options);
     this.modal.dismiss();
     this.nav.pop();
    }
    else
    {
      this.modal.dismiss();
      
    }

    setTimeout(() => {
 if (this.counter == 1)
   {
    this.counter = 0;
   }

  if(this.counter > 1)
  { 
   this.counter = 0;

 if(this.router['routerState'].snapshot.url=='/login' || this.router['routerState'].snapshot.url=='/home')
   navigator['app'].exitApp();
   }
 }, 500);
 });

}
 
    // 


  form : FormGroup;
  data:any;

  validator(){
    this.form = new FormGroup({
      password: new FormControl(null,{validators:[Validators.required,Validators.minLength(6)]}),
      email: new FormControl(null,{validators:[Validators.required,Validators. pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")]}),
    });
  }

  get password()
  {
    return this.form.get('password');
  }
  get email()
  {
    return this.form.get('email');
  }

 async login()
  {
    if(!this.form.valid)
    {
      this.form.markAllAsTouched();
      console.log("Error");
  }
  else
  {
  this.present();
  this.data=this.form.getRawValue();
 await this.afAuth.signInWithEmailAndPassword(this.data.email,this.data.password).then(data=>{
    this.fireDb.database.ref().child("users/").child(`/${data.user.uid}`).on('value',data=>{
    this.mailWrite(this.data.email);
    this.user.userArray=data.val();
    this.dismiss();
    this.ngZone.run(async ()=>{
      await this.router.navigateByUrl('/home');
      this.form.reset();
    })
    })
  }).catch((err)=>{
    this.dismiss();
    this.presentToast();
  })
  }
  }

  password_type="password";
  show = false;
  hide=1;

  show_pw()
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

  async presentToast() {
    const toast = await this.toastController.create({
      message: `The password you entered is incorrect. Please try again`,
      duration: 1500,
      position: 'middle',
      cssClass: 'toast'
    });
    toast.present();
  }

  hidePage=0;

  forgetPw()
  {
    this.hidePage=1;
  }

  backLogin()
  {
    this.hidePage=0;
  }
  
  datamail;
  mailData(event)
  {
   let val =event.target.value;
   this.datamail=val;
   console.log(val);
  }
 
 async resetPw()
  {
    try
    {

    await this.afAuth.sendPasswordResetEmail(this.datamail).then(data=>{
    })
   }
   catch{

   }
   this.presentToast2();



  }

  async presentToast2() {
    const toast = await this.toastController.create({
      message: `Please check your email adress.`,
      duration: 1500,
      position: 'middle',
      cssClass: 'toast'
    });
    toast.present();
  }

  async  readTheme   ()  {
    const contents = await Filesystem.readFile({
      path: 'theme',
      directory: Directory.External,
      encoding: Encoding.UTF8,
    }).then((data)=>{
   
      this.darkmode(data.data);
 
    }).catch((err)=>{
    });
  };

  
  async readMail()  {
    const contents = await Filesystem.readFile({
      path: 'mail',
      directory: Directory.External,
      encoding: Encoding.UTF8,
    }).then((data)=>{
    this.form.setValue({email:data.data,password:''});
      
    }).catch((err)=>{
    });
  };

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

  mode=1;
  check="false"
  darkmode(data)
  {
    if(data=='dark')
    {
      document.body.setAttribute('color-theme','dark');
      this.user.theme="dark"; 
    }
    else
    {
      document.body.setAttribute('color-theme','light'); 
      this.user.theme="light"; 

    }
  }


}
