import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import {userService} from '../userService'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import firebase from 'firebase/app';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  constructor(
    private modalCtrl:ModalController,
    private user:userService,
    private auth:AngularFireAuth,
    private fireDb:AngularFireDatabase,
    private toastController:ToastController

  ) { }

  ngOnInit() {
    this.validator();
    this.validator2();
    this.form.setValue({email:this.user.userArray.email,password:''})
  }

  back()
  {
  this.modalCtrl.dismiss();
  }

  form : FormGroup;
  data:any;

  validator(){
    this.form = new FormGroup({
      password: new FormControl(null,{validators:[Validators.required,Validators.minLength(6)]}),
      email: new FormControl(null,{validators:[Validators.required,Validators. pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")]}),
    });
  }

  get email()
  {
    return this.form.get('email');
  }
  get password()
  {
    return this.form.get('password');
  }


  form2 : FormGroup;
  data2:any;

  validator2(){
    this.form2= new FormGroup({
      password2: new FormControl(null,{validators:[Validators.required,Validators.minLength(6)]}),
      password3: new FormControl(null,{validators:[Validators.required,Validators.minLength(6)]}),

    });
  }

  get password2()
  {
    return this.form.get('password2');
  }
  get password3()
  {
    return this.form.get('password3');
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



  password_type2="password";
  show2 = false;
  hide2=1;
  show_pw2()
  {
   if(this.show2){
     this.password_type2="text";
     this.show2=false;
     this.hide2=0;
   } 
   else
   {
    this.show2=true;
     this.password_type2="password";
     this.hide2=1;

   }
  }


  password_type3="password";
  show3 = false;
  hide3=1;
  show_pw3()
  {
   if(this.show3){
     this.password_type3="text";
     this.show3=false;
     this.hide3=0;
   } 
   else
   {
    this.show3=true;
     this.password_type3="password";
     this.hide3=1;

   }
  }

 err;
  async changeEmail()
  {

    if(!this.form.valid)
    {
      this.form.markAllAsTouched();
      console.log("Error");
  }
  else
  {
    this.data=this.form.getRawValue();

    await this.auth.signInWithEmailAndPassword(this.user.userArray.email,this.data.password).then((suc)=>{
      firebase.auth().currentUser.updateEmail(this.data.email).then(()=>{
        this.fireDb.database.ref('users/'+this.user.userArray.uid).update({
          email:this.data.email,
       })
       this.form.setValue({email:this.user.userArray.email,password:''})
       this.form.markAsUntouched();
       this.err="Your email address has been updated!"
       this.presentToast();

      }).catch((error) => {
      this.err="This email already registered!"
       this.presentToast();
     });
         }).catch((err)=>{
            this.err="Please check your password!"
           this.presentToast();
         })
  }
}


  async changePw()
  {

    if(!this.form2.valid)
    {
      this.form2.markAllAsTouched();
    }
   else
   {
    this.data2=this.form2.getRawValue();

    await this.auth.signInWithEmailAndPassword(this.user.userArray.email,this.data2.password2).then((suc)=>{
      firebase.auth().currentUser.updatePassword(`${this.data2.password3}`).then(() => {
          this.err="Your password has been updated!"
           this.presentToast();
         this.form2.reset();
           }).catch((err)=>{
              this.err="Someting went wrong!";
             this.presentToast();
           })
    }).catch((err)=>{
      console.log(err);
      this.err="Please check your password!";
     this.presentToast();
    })
   }

  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: `${this.err}`,
      duration: 1500,
      position: 'top',
      cssClass: 'toast'
    });
    toast.present();
  }





}
