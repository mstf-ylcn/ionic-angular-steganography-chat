import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonTextarea, ModalController, NavController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page'
import {PopOverService} from '../popoverService'
import { AngularFireDatabase } from '@angular/fire/database';
import {userService} from '../userService'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireStorage  } from '@angular/fire/storage';
import {SteganographyPage} from '../steganography/steganography.page'
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ActionSheetController } from '@ionic/angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';

import { Injectable } from '@angular/core';
import { ContactProfilePage } from '../contact-profile/contact-profile.page';
@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content:IonContent;
   @ViewChild('text') text:IonTextarea;

  constructor(private nav:NavController,
    private pop:PopoverController,
    private popService:PopOverService,
    private modal:ModalController,
    private router:Router,
    private user:userService,
    private fireDb:AngularFireDatabase,
    private sanitizer:DomSanitizer,
    private storage:AngularFireStorage,
    private clipboard: Clipboard,
    public actionSheetController: ActionSheetController,
    private nativePageTransitions:NativePageTransitions) {
    console.log("chat")
   }
   
   date;
   keyboard;
   send_Icon_Control=0;
  ngOnInit() {
    Keyboard.addListener('keyboardWillShow', info => {
    this.keyboard=info.keyboardHeight;
    this.content.scrollToPoint(0,(this.height+this.keyboard));

    });
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 50);
  }

  ionViewWillEnter()
  {
   this.date=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
    this.getMessages();
    setTimeout(() => {
     this.content.scrollToBottom(); 
    });
  }
 

  ionViewWillLeave()
  {
   this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).once('value',data=>{
     if(data.exists())
     {
      data.forEach(uid=>{
        this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+uid.val().pushId).update({
          read:true,
        }
        )
      })
     }
      })
  }

  height;
  logScrolling(event)
  {
    this.height=event.detail.scrollTop;
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


  sendMessages()
  { 

    if(this.clickControl==1)
    {
      this.clickControl=0;
      return;
    }
    else
    {

      this.fireDb.database.ref('conversations/'+this.user.userArray.uid).child(`${this.user.chatUId}`).set({
      uid:this.user.chatUId,
      time:Date.now()
    })

    this.fireDb.database.ref('conversations/'+this.user.chatUId).child(`${this.user.userArray.uid}`).set({
      uid:this.user.userArray.uid,
      time:Date.now()
    })
      
    var res=this.messageData.trim();
    var res2=res.trim();
    if(res2!='')
    {
    // this.array.push("as");
      var pushId=this.fireDb.createPushId();
      this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+pushId).set({
        data:`${this.messageData}`,
        dataType:"text",
        date:(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5)),
        from:`${this.user.userArray.uid}`,
        pushId:pushId,
        read:true
      })
      this.fireDb.database.ref('messages/'+this.user.chatUId+'/'+this.user.userArray.uid+'/'+pushId).set({
        data:`${this.messageData}`,
        dataType:"text",
        date:(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5)),
        from:`${this.user.userArray.uid}`,
        pushId:pushId,
        read:false
      })
      this.text.setFocus();
      this.messageData="";
      this.content.scrollToBottom(200);
      // this.content.scrollByPoint(0,(this.height+this.keyboard),200);
    }
    }
    
  }

  messages=[];
  chatUserData=[];
  messageCounter;
  getMessages()
  {
    this.fireDb.database.ref('users/'+this.user.chatUId).on('value',data=>{
    this.chatUserData=[];
    this.chatUserData.push(data.val());
    this.chatUserData.forEach(data=>{
      data.name=this.user.contactName;
    })
   })

   //read message
   this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).once('value',data=>{
   data.forEach(uid=>{
      this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+uid.val().pushId).update({
        read:true,
      }
      )
    })
   })

   //get messages
   var counter=0;
     this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).once('value',data=>{
       if(data.exists())
       {
          this.start=data.numChildren()-20;
          this.end=data.numChildren();
          this.user.messages=[];
          data.forEach(data2=>{
            if(counter<data.numChildren()-1)
            {
              this.user.messages.push(data2.val());
              counter++;
            }
         })
         setTimeout(() => {
          this.content.scrollToBottom();
        },100);
       }
     })

     this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).on('value',data=>{
      if(data.exists())
      {
         this.messageCounter=data.numChildren();
         console.log("test:"+this.messageCounter);
      }
    })

                                                                                          //limit to last ???
     this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).limitToLast(1).on('value',lastData=>{
      this.date=(new Date().toISOString().slice(0, 10));
    
        var index;
        //delete messages;
        if(this.messageCounter>this.user.messages.length)
        {
        this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).on('child_removed',data=>{
         index = this.user.messages.findIndex(i => i.pushId === data.key);
        if(index!=-1)
        {
          this.user.messages.splice(index,1);
        }
        })
      }
  

      //first messages
       this.end=this.messageCounter;
      if(this.messageCounter==1)
       {
         this.end=1;
       }

       if(this.end<25)
       {
         this.start=0;
         this.infiniteScrooll="true";
       }

       else
       {
        this.infiniteScrooll="false";
       }


       if(this.messageCounter==this.end)
       {
         if(this.end>26)
         {
          this.end++;
          this.start=this.end-25;
         }
         else
         {
           this.end++;
         }
         
        lastData.forEach(element => {
        var index=this.user.messages.findIndex(i=>i.pushId ===element.val().pushId);
       if(index==-1)
       {
        this.user.messages.push(element.val());
        setTimeout(() => {
          this.content.scrollToBottom(300);
        });
          }
        });
       }
 
      // console.log(this.messages);
       this.scroolControl=0;
    })

 
 }



  pressMessage(pushId,text,date,name,from)
  {
        
    if(this.user.pressControl==0)
    {
      this.user.selectMessagesArray.push(pushId);
      this.user.selectFrom.push(from);
 
      if(text!='')
      this.user.selectTextArray.push({text:text,date:date,from:name,pushId:pushId});
      else
      this.user.selectTextArray.push({text:'(photo)',date:date,from:name,pushId:pushId});
      
      this.user.pressControl=1;
    }
  }


 selectMessage(pushId,text,date,name,from)
 {
    if(this.user.pressControl==1)
    {
      this.user.pressControl++;
      return;
    }

    if(this.user.pressControl==2)
    {
     
    var index=this.user.selectMessagesArray.indexOf(pushId,0)
     if(index!=-1)
     {
       this.user.selectMessagesArray.splice(index,1);
       this.user.selectFrom.splice(index,1);

       
       this.user.selectTextArray.splice(index,1);
 
     
       if(this.user.selectMessagesArray.length==0)
       {
         this.user.pressControl=0;
       }
     }
     else
     {
      this.user.selectMessagesArray.push(pushId);
      this.user.selectFrom.push(from);
 
      if(text!='')
      this.user.selectTextArray.push({text:text,date:date,from:name,pushId:pushId});
      else
      this.user.selectTextArray.push({text:'(photo)',date:date,from:name,pushId:pushId});

 
     }
    }
    
  
  
   console.log(this.user.selectMessagesArray);
   console.log(this.user.selectTextArray);
   console.log(this.user.selectFrom);
 }
 
//delete for all


 //for me
 deleteMessageForMe()
 {
  this.user.selectMessagesArray.forEach(pushId => {
   this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+pushId).remove().then(()=>{
    this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId).once('value',data=>{
      if(!data.exists())
      {
        this.fireDb.database.ref('conversations/'+this.user.userArray.uid+'/'+this.user.chatUId).remove();
      }
   })
   })
  });

  this.user.selectFrom=[];
  this.user.selectMessagesArray=[];
  this.user.selectTextArray=[];
  this.user.pressControl=0;
 }


 
deleteMessageForEveryone()
{
  for (let i = 0; i < this.user.selectMessagesArray.length; i++) {
    if(this.user.selectFrom[i]==this.user.userArray.uid)
    {
      this.fireDb.database.ref('messages/'+this.user.chatUId+'/'+this.user.userArray.uid+'/'+this.user.selectMessagesArray[i]).remove().then(()=>{
        this.fireDb.database.ref('messages/'+this.user.chatUId+'/'+this.user.userArray.uid).once('value',data=>{
          if(!data.exists())
          {
            this.fireDb.database.ref('conversations/'+this.user.chatUId+'/'+this.user.userArray.uid).remove();
          }
        })
      });
    }

    this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+this.user.selectMessagesArray[i]).remove().then(()=>{
      if(this.user.messages.length==0)
      {
        this.fireDb.database.ref('conversations/'+this.user.userArray.uid+'/'+this.user.chatUId).remove();
      }
     })
  }
  
  this.user.selectFrom=[];
  this.user.selectMessagesArray=[];
  this.user.selectTextArray=[];
  this.user.pressControl=0;

  
}

 unSelect()
 {
   this.user.pressControl=0;
   this.user.selectFrom=[];
   this.user.selectMessagesArray=[];
   this.user.selectTextArray=[];
 }
 copyText()
 {
   var text="";
   this.user.selectTextArray.forEach(data => {
     text+='['+data.date.slice(8,10)+'-'+data.date.slice(5,7)+'-'+data.date.slice(2,4)+' '+data.date.slice(11,16)+']'+' '+data.from+": "+data.text+"  ";
   });
   console.log(text);

 this.clipboard.copy(text);
 this.user.pressControl=0;
 this.user.selectMessagesArray=[];
 this.user.selectTextArray=[];
 this.user.selectFrom=[];

 }
 
  messageData="";
  css="";
  chatInput()
  {
    setTimeout(() => {
      
      // console.log(this.messageData);

      if(this.messageData.length!=0 )
      {
        if(this.messageData.trim()!='')
        {
          this.send_Icon_Control=1
          this.css="slide-out-right";
        }
        
      }
      else
      {
        this.css="slide-in-right";
        this.send_Icon_Control=0;
      }

    });
  }

  attach()
  {
    if(this.keyboardOpen==1)
    {
      this.text.setFocus();
      this.keyboardOpen=0;
    }
  }
   keyboardOpen=0;
  keyboardIsOpen()
  {
  this.keyboardOpen=1;
  }
  cancel()
  {
    if(this.messageData.length==0)
    {
      this.css="slide-in-right";
      this.send_Icon_Control=0;
    }
  }


  camera()
  {
    this.text.setFocus();
    




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


  pressPopOverControl=0;
  async pressPopover(ev: any) {
    if(this.pressPopOverControl==1)
    {
      this.pressPopOverControl=0
      return;
    }
    else
    {
      this.popService.pageControl=3;
      const popover = await this.pop.create({
        component: PopoverPage,
        cssClass: 'homepop_css',
        event: ev,
        translucent: true,
        showBackdrop:false,
      });
      await popover.present();
    }
 
  }

  popOverPan()
  {

    this.pressPopOverControl=1
  }

  async unShiftPopover(ev: any) {
    if(this.pressPopOverControl==1)
    {
      this.popService.pageControl=4;
      const popover = await this.pop.create({
        component: PopoverPage,
        cssClass: 'homepop_css',
        event: ev,
        translucent: true,
        showBackdrop:false,
      });
      await popover.present();
      this.pressPopOverControl=0;
    }
  
  }

 async profil()
  {
    const modal = await this.modal.create({
      component: ContactProfilePage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }


  
//   profil()
//  {
//    this.router.navigateByUrl('/contact-profile');
//  }

 
 photoUrl;
 uploadImg;
 async getCamera()
 {
   setTimeout(() => {
    this.photoControl=0;
    this.SteganographyPage();
   }, 300);
   const image= await Camera.getPhoto({
     quality:50,
     allowEditing:false,
     resultType:CameraResultType.DataUrl,
     source:CameraSource.Camera,
     saveToGallery:true,
     preserveAspectRatio:true,
     correctOrientation:true,
   }).then(res=>{
     this.photoUrl= (res.dataUrl);
     this.user.photo=this.photoUrl;

   }).catch(e=>{
     alert(JSON.stringify(e));
     this.modal.dismiss()
    
   })
 }
 async getGallery()
 {
  setTimeout(() => {
    this.photoControl=0;
    this.SteganographyPage();
   },300);
   const image= await Camera.getPhoto({
     quality:50,
     allowEditing:false,
     resultType:CameraResultType.DataUrl,
     source:CameraSource.Photos,
     preserveAspectRatio:true,
     correctOrientation:true,
   }).then(res=>{
     this.photoUrl= (res.dataUrl);
     this.user.photo=this.photoUrl;
   }).catch(e=>{
     alert(JSON.stringify(e));
     this.modal.dismiss();
   })
 
 }
 
 scroolControl=0;
 control=1;
 scroolBottom()
 {
   if(this.scroolControl==0)
   {
    
    if(this.control==1)
    this.control++;
    setTimeout(() => {
      this.content.scrollToBottom();
     });
   }
 }
 name;
 imgDate;
 openImg(photoUrl,data,date,userControl,pushId)
 {
   if(this.user.selectMessagesArray.length==0)
   {

   if(data!='')
   {
  this.user.photoText=data;
  }
   if(userControl==0)
   {
    this.name=this.chatUserData[0].email;
   }
   else
   {
     this.name="You";
   }
   this.imgDate=date;
   this.photoControl=1;
   this.user.pushId=pushId;
   this.user.photo=photoUrl;
   this.SteganographyPage();
  }

 }
 
 photoControl;
 async SteganographyPage()
 {
   const modal = await this.modal.create({
     component: SteganographyPage,
     cssClass: 'my-custom-class',
     componentProps: { photoControl:this.photoControl,
     name:this.name,imgDate:this.imgDate,}
   });

    modal.onWillDismiss().then(()=>{
      setTimeout(() => {
        this.user.photoText="";
        this.user.photo="";
        this.photoControl=0;
        this.user.decodeControl=0;
        this.user.photo2="";
        this.user.photo3="";
      }, 200);
   })
   return await modal.present();
 }
 
 start;
 end=0;
 infiniteScrooll="false"
 loadData(event) {
   this.scroolControl=1;
   if(this.start==0 || this.end<25)
   {
     this.infiniteScrooll="true";
   }
  setTimeout(() => {
    if(this.start>0)
    {
      this.start-=25;
      if(this.start<0)
      {
        this.start=0;
      }
    }
    event.target.complete();
  }, 1000);
}



async presentActionSheet() {
  const actionSheet = await this.actionSheetController.create({
    header: `Delete message ? (${this.user.selectMessagesArray.length})`,
    cssClass: 'my-custom-class',
    buttons: [{
      text: 'Delete for me',
      role: 'destructive',
      icon: 'trash',
      handler: () => {
        this.deleteMessageForMe();
      }
    }, {
      text: 'Delete for everyone',
      icon: 'trash-bin',
      role: 'destructive',
      handler: () => {
        this.deleteMessageForEveryone();
      }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]
  });
  await actionSheet.present();

}


clickControl=0;
panStart()
{
  if(this.clickControl==0)
  {
    this.text.setFocus();
    this.clickControl=1;
   
  }
}

sendShiftedMessages()
{
  if(this.clickControl==1)
  {
    this.clickControl=0;
    this.shift();
  }
}




char =    ['y','z','w','x','v','u','t','ç','s','r','p','q','ş','o','n','m','ö','l','i','k','j','ı','h','f','g','d','a','e','b','c','ğ','ü',
           'A','B','C','D','E','F','Z','Ç','Y','X','V','W','Ö','Ş','G','H','K','J','I','L','Ü','M','N','O','İ','S','R','Q','T','P','Ğ','U',
           ',','.','?','!','"',"'",'(','+','-','_',')',':','<','=','>','/',';','8','3','2','1','0','5','6','7','4','9','%','&','*',
           '#','@','[','{',']','}','|','€','÷','’'
          ];


arrayShift=[];
shiftCounter=0;

shifter=1;

shift()
{
  var newword="";

  this.arrayShift=this.messageData.split(' ');

  for (let index = 0; index < this.messageData.length; index++) {
    
    if(this.messageData[index]!=" ")
    {
    var start=this.char.indexOf(this.messageData[index]);

    if((index-1)==((this.arrayShift[this.shiftCounter].length)) && (this.shiftCounter<this.arrayShift.length-1) )
    {
     this.shiftCounter++; 
    }
    
    var unShifted=(start-this.shifter)
 
    if(unShifted<0)
    {
      newword+=this.char[(this.char.length)-this.shifter+start]; 
    }
    else
    {
      newword+=this.char[unShifted]; 
    }
    this.shifter++;
   }

   else
   {
    newword+=" ";
     this.shifter=1;

   }
   
  }
  this.messageData=newword;
  this.sendMessages();
  this.shiftCounter=0;  
  this.arrayShift=[];
  this.shifter=1;  
}

unShiftWord=[];
unshift()
{
  var newWord="";
  for (let i = 0; i < this.user.selectTextArray.length; i++) {
    this.arrayShift=this.user.selectTextArray[i].text.split(' ');

  for (let index = 0; index < this.user.selectTextArray[i].text.length; index++) {
   
   if(this.user.selectTextArray[i].text[index]!=" ")
   {

   var start=this.char.indexOf(this.user.selectTextArray[i].text[index]);

   if((index-1) == (this.arrayShift[this.shiftCounter].length) && (this.shiftCounter<this.arrayShift.length-1) )
   {
    this.shiftCounter++; 
   }

   var shifted=((start+this.shifter)%(this.char.length));
   newWord+=this.char[shifted]; 
      this.shifter++;
  }

  else
  {
    newWord+=" ";
    this.shifter=1;

  }
  
 }
 this.shiftCounter=0;  
 this.arrayShift=[];
 this.shifter=1;
 this.unShiftWord.push({text:newWord,pushId:this.user.selectTextArray[i].pushId});
  newWord="";
 }

  for (let j = 0; j <  this.unShiftWord.length; j++) {
     
    var index=this.user.messages.findIndex(i=>i.pushId === this.unShiftWord[j].pushId)
    if(index!=-1)
    {
      console.log(index);
      console.log(this.user.messages[index].data);
      console.log(this.unShiftWord[j].text)
      this.user.messages[index].data=this.unShiftWord[j].text;
    }

  }
 console.log(this.unShiftWord);
 this.unShiftWord=[];
 this.user.pressControl=0;
 console.log(this.user.pressControl);
 this.user.selectMessagesArray=[];
 this.user.selectTextArray=[];
 this.user.selectFrom=[];
}



}
