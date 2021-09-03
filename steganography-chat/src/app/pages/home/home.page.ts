import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonFabButton, ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page'
import {PopOverService} from '../popoverService'
import {userService} from '../userService'
import { AngularFireDatabase } from '@angular/fire/database';
import { Platform } from '@ionic/angular';
import {EditProfilePage} from '../edit-profile/edit-profile.page'
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('fab') fab:IonFabButton;

  constructor(private router:Router,
    private pop:PopoverController,
    private popService:PopOverService,
    private user:userService,
    private fireDb:AngularFireDatabase,
    private platform:Platform,
    private modal:ModalController,
    private nativePageTransitions:NativePageTransitions) { 
    console.log("home")
  }

  ngOnInit() {
    this.getContact();
    this.getMessages();
    // this.status();
    // this.statusPause();
    // this.statusResume();
  }

  // page="/home";
  // statusPause()
  // {
  //   this.platform.pause.subscribe(async () => {
  //     this.page=this.router['routerState'].snapshot.url;
  //     var ref=this.fireDb.database.ref('users/'+this.user.userArray.uid);
  //     ref.update({
  //       status:`${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0,5)}`
  //     })
  //   });
  // }

  // statusResume()
  // {
  //   this.platform.ready().then(()=>{
  //     this.platform.resume.subscribe(async () => {
  //       var ref=this.fireDb.database.ref('users/'+this.user.userArray.uid);
  //       ref.update({
  //         status:'Online'
  //       }).then(()=>{
  //       // this.router.navigateByUrl(this.page);
  //       })
  //     });
  //   })
  
  // }

  // status()
  // {
  //   var ref=this.fireDb.database.ref('users/'+this.user.userArray.uid);
  //   ref.update({
  //     status:'Online'
  //   })
  //   ref.onDisconnect().update({
  //     status:`${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0,5)}`
  //   })
  // }


  
  conversations=[];
  tempMessageArray=[];
  lastMessageArray=[];
  unRead=[];
  date;
  getMessages()
  {
   
   var conversationsSort=[];
   this.fireDb.database.ref('conversations/'+this.user.userArray.uid).on('value',data=>{

    if(data.exists())
 {

   conversationsSort=[]; 
   data.forEach(el=>{
     conversationsSort.push(el.val());
    })
    for (let i = 0; i < conversationsSort.length; i++) {
     for (let j = 0; j < conversationsSort.length; j++) {
       if(conversationsSort[j].time<=conversationsSort[i].time)
       {
        var temp=conversationsSort[i];
        conversationsSort[i]=conversationsSort[j];
        conversationsSort[j]=temp;
       }
     }   
   }
   
  //  var index4=0;
  //   var counter=0;
  //   for (let i = 0; i < conversationsSort.length; i++) {
  //   this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+conversationsSort[i].uid).on('value',data=>{
  //     counter=0;
  //     data.forEach(data2=>{
        
  //       for (let j = 0; j < this.unRead.length; j++) {
  //        index4=this.unRead[j].uid.indexOf(conversationsSort[i].uid);
  //        if(index4!=-1)
  //        {
  //          break;
  //        }         
  //       }
  //       if(data2.val().read==false)
  //       {
  //         counter++;
  //       }
  //     })
      
  //     if(index4!=-1)
  //     {
  //     this.unRead[index4]={uid:conversationsSort[i].uid,counter:counter};
  //     }
  //     else
  //     {
  //      this.unRead.push({uid:conversationsSort[i].uid,counter:counter});
  //     }
  //   })
    //  }


     this.date=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
     setTimeout(() => {
       this.fireDb.database.ref('messages/'+this.user.userArray.uid).on('value',id=>{
         if(id.exists())
         {
          this.tempMessageArray=[];
          this.conversations=[];
          this.tempMessageArray=Object.keys(id.val());
         }
     
          this.lastMessageArray=[];
          var index2=0;
           var index=0;
           conversationsSort.forEach(id=>{
            this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+id.uid).limitToLast(1).on('value',lastData=>{
              if(lastData.exists())
              {
                for (let i = 0; i < this.lastMessageArray.length; i++) {
                  index2=this.lastMessageArray[i].uid.indexOf(id.uid)
                  // index2=this.lastMessageArray[i].from.indexOf(id)
                  if(index2!=-1)
                  {
                    break;
                  }
                }
                if(index2!=-1)
                {
                  this.lastMessageArray[index2]={uid:id.uid,data:lastData.child(`${Object.keys(lastData.val())}`).val()};
                  // this.lastMessageArray[index2]=(lastData.child(`${Object.keys(lastData.val())}`).val());
     
                }
                else
                {
                  this.lastMessageArray.push({uid:id.uid,data:lastData.child(`${Object.keys(lastData.val())}`).val()});
                  // this.lastMessageArray.push(lastData.child(`${Object.keys(lastData.val())}`).val());
     
                }
                // console.log(this.lastMessageArray);
              }
           })
        
     
           this.fireDb.database.ref('users/'+id.uid).on('value',data=>{
             for (let i = 0; i < this.conversations.length; i++) {
              index=this.conversations[i].uid.indexOf(data.child('uid').val())
              if(index!=-1)
              {
                break;
              }
             }
             if(index!=-1)
             {
               this.conversations[index]=data.val();
             }
             else
             {
              this.conversations.push(data.val());
             }
           })
         })
         
       })  
     
     },);

 }
 else
 {
  this.conversations=[];
  this.tempMessageArray=[];
  this.lastMessageArray=[];
  this.unRead=[];

 }
   
// 200
   })

  }


  getContact()
  {
   var tempContactArray=[];
    this.fireDb.database.ref('contact/'+this.user.userArray.uid).on('value',contact=>{
      tempContactArray=[];
      contact.forEach(data=>{
        tempContactArray.push(data.val().uid);
      })
        this.user.contactArray=[];
        tempContactArray.forEach(id=>{
        this.fireDb.database.ref('users/'+id).once('value',data=>{
          this.user.contactArray.push(data.val());
        })
      })
    })
  }

  chat(uid,email,name)
  {

    this.user.chatUId=uid;
    this.user.contactEmail=email;
    this.user.contactName=name;


    let options:NativeTransitionOptions={
      direction:'left',
      duration:300,
    }
    this.nativePageTransitions.slide(options);
    this.router.navigateByUrl('/chat');
  }
   
  css_control="slide-out-right";
  async contact(ev)
  {
      // const modal = await this.modal.create({
      //   component: ContactPage,
      //   cssClass: 'my-custom-class',
      // });

      // return await modal.present().then(()=>{
      // });

      let options:NativeTransitionOptions={
        direction:'left',
        duration:300,
      }
      this.nativePageTransitions.slide(options);

      this.router.navigateByUrl('/contact')
  }


  async presentPopover(ev: any) {
    this.popService.pageControl=0;
    const popover = await this.pop.create({
      component: PopoverPage,
      cssClass: 'homepop_css',
      event: ev,
      translucent: true,
    });
    await popover.present();

    // await popover.onDidDismiss();
  }

  profile()
  {


    // this.router.navigateByUrl('edit-profile');
    this.editprofile();
  }
  

  async editprofile() {
    const modal = await this.modal.create({
      component: EditProfilePage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }


  async chatpage() {
    const modal = await this.modal.create({
      component: EditProfilePage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  
}