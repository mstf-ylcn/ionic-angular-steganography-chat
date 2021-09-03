import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import {userService} from '../userService'

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {

  constructor(private modal:ModalController,
    private fireDb:AngularFireDatabase,
    private user:userService,
    private loadingController:LoadingController,
    private toastController:ToastController) { }

  ngOnInit() {
    this.validator();
  }

  
  form : FormGroup;
    data:any;

    validator(){
      this.form = new FormGroup({
        email: new FormControl(null,{validators:[Validators.required,Validators. pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")]}),
      });
    }

    get email()
    {
      return this.form.get('email');
    }


  back()
  {
this.modal.dismiss();
  }
  



  addContact()
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
  console.log(this.user.contactArray.name+" "+this.data.name)
  console.log( this.user.contactArray.email+" "+this.data.email)
  var control=0;
  for (let index = 0; index < this.user.contactArray.length; index++) {
    if(this.user.contactArray[index].email==this.data.email )
    {
     control=1;
    }
  }
       if(this.data.email==this.user.userArray.email)
       {
        this.dismiss();
        this.errorMsg="You can't add yourself!"
        console.log("You can't add yourself!");
        this.presentToast();
       }

      else if(control==1)
       {
         this.dismiss();
         console.log("User already exist!");
         this.errorMsg="User already exist!"
         this.presentToast();
         return;
       }

       else if(this.data.email!=this.user.userArray.email)
        {
        this.fireDb.database.ref().child("users").orderByChild("email").equalTo(`${this.data.email}`).on("value",snapshot => {
         if (snapshot.exists()){
           var userData;
           snapshot.forEach(element => {
           userData=element.val();
             });

           var uid=this.user.userArray.uid;
         this.fireDb.object('contact/'+uid+'/'+userData.uid).set({
         uid:userData.uid
         }).then(()=>{
         this.dismiss();
         console.log("contact added");
         this.form.reset();
         this.modal.dismiss();
         }).catch(()=>{
           this.errorMsg="Someting went wrong!"
           this.presentToast();
           this.dismiss();
           console.log("error");
         })
         }
           else
             {
            this.dismiss();
            console.log("User doesn't exist");
            this.errorMsg="User doesn't exist!"
            this.presentToast();
        }
    })
    }
    }
  }
errorMsg;

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
      message: `${this.errorMsg}`,
      duration: 1500,
      position: 'top',
      cssClass: 'toast'
    });
    toast.present();
  }



}
