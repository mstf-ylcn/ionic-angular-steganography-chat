import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActionSheetController, IonContent, IonSlides, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import {userService} from '../userService'
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page'
import {PopOverService} from '../popoverService'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController } from '@ionic/angular';
import { Downloader,DownloadRequest,NotificationVisibility } from '@ionic-native/downloader/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-steganography',
  templateUrl: './steganography.page.html',
  styleUrls: ['./steganography.page.scss'],
})
export class SteganographyPage implements OnInit {
  @ViewChild(IonSlides, {static: false})slider: IonSlides;
  @ViewChild('pic', { static: false }) pic: ElementRef;
  @ViewChild('pic2', { static: false }) pic2: ElementRef;
  @ViewChild(IonContent) content:IonContent;



  constructor(private user:userService,
    private modal:ModalController,
    private fireDb:AngularFireDatabase,
    private storage:AngularFireStorage,
    private loadingController:LoadingController,
    private navparams:NavParams,
    private pop:PopoverController,
    private popService:PopOverService,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    private downloader:Downloader) { }

    photoControl;
    name;
    imgDate;
    date;

  ngOnInit() {
  this.date=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
  this.photoControl=this.navparams.get('photoControl');
  this.name=this.navparams.get('name');
  this.imgDate=this.navparams.get('imgDate');
  }
  
  
  ionViewDidEnter(){
    this.slider.update();
  }
   
  ionViewWillLeave()
  {
    this.dismiss();
    this.dismiss2();
  }
  

  sliderOpts={
    zoom:{
      maxRation:2,
      maxRatio:5,
    },
  };

  sliderOpts2={
    slidesPerView:1.1,
    loop:true
  };

  async zoomEnd(zoomslides:IonSlides)
  {
   const slider= await zoomslides.getSwiper();
   const zoom=slider.zoom;
   zoom.out();
  }

  back()
  {
    setTimeout(() => {
      this.photoControl=0;
    }, 200);
    this.modal.dismiss();
  }
  messageData="";

  sendImages()
  {
    this.fireDb.database.ref('conversations/'+this.user.userArray.uid).child(`${this.user.chatUId}`).set({
      uid:this.user.chatUId,
      time:Date.now()
    })

    this.fireDb.database.ref('conversations/'+this.user.chatUId).child(`${this.user.userArray.uid}`).set({
      uid:this.user.userArray.uid,
      time:Date.now()
    })
      
      var pushId=this.fireDb.createPushId();
      this.fireDb.database.ref('messages/'+this.user.userArray.uid+'/'+this.user.chatUId+'/'+pushId).set({
        url:this.imgUrl,
        dataType:"img",
        data:`${this.messageData}`,
        date:(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5)),
        from:`${this.user.userArray.uid}`,
        pushId:pushId,
        read:true
      })
      this.fireDb.database.ref('messages/'+this.user.chatUId+'/'+this.user.userArray.uid+'/'+pushId).set({
        url:this.imgUrl,
        dataType:"img",
        data:`${this.messageData}`,
        date:(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5)),
        from:`${this.user.userArray.uid}`,
        pushId:pushId,
        read:false
      })
      this.dismiss();
      this.modal.dismiss();
      this.messageData="";
      // this.content.scrollByPoint(0,(this.height+this.keyboard),200);
  }


time;
imgUrl;
error=0;
uploadImage()
{
  if(this.clickControl==1)
  {
    this.clickControl=0;
    return;
  }
  else
  {
  this.present();
  this.imgUrl=this.dataUrltoBlob(this.user.photo);
 this.time=(new Date().toISOString().slice(0, 10)+" "+new Date().toTimeString().slice(0,5));
  var upload= this.storage.upload("photos/"+`${this.user.userArray.uid}/${this.fireDb.createPushId()}+${this.time}.jpg`,this.imgUrl);
  upload.then(res=>{
    res.task.snapshot.ref.getDownloadURL().then(downloadableUrl=>{
      console.log(downloadableUrl);
       this.imgUrl=downloadableUrl;
    }).then(()=>{
      this.sendImages();
    })
  })
  }


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


isLoading2;
async present2() {
  this.isLoading2 = true;
  return await this.loadingController.create({
    cssClass: 'transparent',
  }).then(a => {
    a.present().then(() => {
      if (!this.isLoading2) {
        a.dismiss().then();
      }
    });
  });
}

async dismiss2() {
  this.isLoading2 = false;
  return await this.loadingController.dismiss().then();
}




clickControl=0;
panStart()
{
  if(this.clickControl==0)
  {
    this.clickControl=1;
   
  }
}

actionSheet()
{
  if(this.clickControl==1)
  {
    this.presentActionSheet();
    this.clickControl=0;
  }
}

photo2;
async getImages()
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
      this.hidePhoto=1;
      this.photo2= (res.dataUrl);

  }).catch(e=>{
    
   
  })
}
hideMessageData="";
hideText=0;
hidePhoto=0;
async presentActionSheet() {
  const actionSheet = await this.actionSheetController.create({
    header: "Please select",
    cssClass: 'my-custom-class',
    buttons: [{
      text: 'Hide text',
      role: 'destructive',
      icon: 'document-text',
      handler: () => {
        this.hideText=1;
      }
    }, {
      text: 'Hide photo',
      icon: 'images',
      role: 'destructive',
      handler: () => {
        // this.hideText=1;
        this.getImages();
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

width;
height;
wordSize;
getSize() {
  this.width=(this.pic.nativeElement as HTMLImageElement).naturalWidth;
  this.height=(this.pic.nativeElement as HTMLImageElement).naturalHeight;

   this.wordSize=Math.floor((this.width*this.height*4)/8)-16;
   this.size=this.wordSize;
  }

  width2;
  height2;
  getSize2() {
   this.width2=(this.pic2.nativeElement as HTMLImageElement).naturalWidth;
   this.height2=(this.pic2.nativeElement as HTMLImageElement).naturalHeight;
   }

  size;
  chatInput(ev)
  {
    if(this.hideMessageData.length>=2)
    {
      this.error=0;
    }

    this.size=this.wordSize;
    this.size=this.size-ev.target.value.length;  
  }

  sendHideText()
{
  if(this.hideMessageData.length<2)
  {
   this.error=1;
  }
  else
  {
    this.present2();
   this.asciiToBinary();
  }
}

addedZero="";
addZeros(data)
{
  this.addedZero=data;
    for (let index = data.length; index < 8; index++) {
    this.addedZero="0"+this.addedZero;
    }
}

 binaryword="";
 start="0000001000101111";
 ending="0101110000110000";

asciiToBinary()
{
  this.binaryword=this.start;
   var control="";
   console.log(this.hideMessageData.length);
      for (let index = 0; index < this.hideMessageData.length; index++) {
      
    var binary=(this.hideMessageData.charCodeAt(index) >>> 0).toString(2);

    if(binary.length<8)
    {
      this.addZeros(binary);
    }
    else if(binary.length==8)
    {
      this.addedZero=binary;
    }
    else
    {
      console.log(binary);
      //Turkish characters
      //İı şŞ ğĞ = 9 digit
      // ı= 100110001 ~ 00000100  
      // İ= 100110000   00000101
      // ş= 101011111   00000110
      // Ş= 101011110   00000111
      // ğ= 100011111   00001000
      // Ğ= 100011110   00001010

      if(binary=="100110001")
      {
        this.addedZero="00000100"
      }
      else if(binary=="100110000")
      {
        this.addedZero="00000101"

      }
      else if(binary=="101011111")
      {
        this.addedZero="00000110"
        
      }
      else if(binary=="101011110")
      {
        this.addedZero="00000111"
        
      }
      else if(binary=="100011111")
      {
        this.addedZero="00001000"
        
      }
      else if(binary=="100011110")
      {
        this.addedZero="00001010"
      }
    }
   
    control=control+" "+this.addedZero;
    this.binaryword=this.binaryword+this.addedZero;
   }
   
   this.binaryword= this.binaryword+this.ending;
   console.log(this.binaryword);

   this.imgTextEncode();
}

imgTextEncode()
{
  var img=this.pic.nativeElement;
  console.log(img)
  var canvas=<HTMLCanvasElement> document.getElementById("canvas");
  var ctx=canvas.getContext("2d");

  ctx.drawImage(img,0,0);

  var pixel=ctx.getImageData(0,0,this.width,this.height);
  
  for (let index = 0; index < this.binaryword.length; index++) {
    
    var rgba=(pixel.data[index]>>>0).toString(2);//converting decimal to binary
    
    var tempArray=[...rgba];

    tempArray[rgba.length-1]=this.binaryword[index];

    rgba=tempArray.join('');

   var convertToDecimal=parseInt(rgba,2);
  
   pixel.data[index]=convertToDecimal;

  }

  ctx.putImageData(pixel,0,0);
  
   this.user.photo = canvas.toDataURL();
   this.dismiss2();
   this.uploadImage();

}





newHeight;
newWidth;
widthHeight;
resizeControl=0;
imageResize()
{
 var orjImageSize=this.width*this.height*4;
 var hideImageSize=this.width2*this.height2*4;  
 
 var min=((orjImageSize*100)/(hideImageSize*8))/100;

 if((hideImageSize*8)<orjImageSize)
 {

   this.newWidth=this.width2.toString();
   this.newHeight=this.height2.toString();
   this.resizeControl=0;

 }
 else
 {
   this.resizeControl=1;
   for (let index = min; index < 1; index+=0.0001) {

     var newWidth=Math.floor(this.width2*(index));
     var newHeight=Math.floor(this.height2*(index));

     var newSize=((newWidth*newHeight)*32);

     if((newSize+10000)>orjImageSize)
     {

       this.newHeight=newHeight.toString();
       this.newWidth=newWidth.toString();
       this.width2=newWidth.toString();//?????????????????????
       this.height2=newHeight.toString();//?????????????????????
       // this.widthHeight="0"+newWidth.toString()+"0"+newHeight.toString();
       break;
     }
   }

  //  for (let i = 0; i <4; i++) {
  //   if(this.newWidth.length<4)
  //   {
  //   this.newWidth=('0'+this.newWidth);
  //   }
  //   if(this.newHeight.length<4)
  //   {
  //    this.newHeight=('0'+this.newHeight);
  //   }
  // }



 }
setTimeout(() => {
  if(this.resizeControl==1)
  {
    this.dismiss2();
    this.presentAlertConfirm();
    return;
  }
  else
  {
   setTimeout(() => {
     this.pipEncode();
   }, 100);
  }
}, );


}


counter=0;
sizeCounter=0;
async pipEncode()
{

this.widthHeight='0'+this.newWidth+'0'+this.newHeight;

var orjImage=this.pic.nativeElement;
var hideImage=this.pic2.nativeElement;

var canvas=<HTMLCanvasElement> document.getElementById("canvas");
var canvas2=<HTMLCanvasElement> document.getElementById("canvas2");

canvas2.width=this.newWidth;
canvas2.height=this.newHeight;


var ctx=canvas.getContext("2d");
var ctx2=canvas2.getContext("2d");

 
ctx.drawImage(orjImage,0,0);
ctx2.drawImage(hideImage,0,0,this.newWidth,this.newHeight);

 
var orjImagePixels=ctx.getImageData(0,0,this.width,this.height);
var hideImagePixels=ctx2.getImageData(0,0,this.newWidth,this.newHeight);

console.log("orj :"+orjImagePixels.data.length);
console.log("hide :"+hideImagePixels.data.length);




for (let index = 0; index < orjImagePixels.data.length; index+=8) {

 var r=(orjImagePixels.data[index]>>>0).toString(2);
 var g=(orjImagePixels.data[index+1]>>>0).toString(2);
 var b=(orjImagePixels.data[index+2]>>>0).toString(2);
 var a=(orjImagePixels.data[index+3]>>>0).toString(2);
 var r2=(orjImagePixels.data[index+4]>>>0).toString(2);
 var g2=(orjImagePixels.data[index+5]>>>0).toString(2);
 var b2=(orjImagePixels.data[index+6]>>>0).toString(2);
 var a2=(orjImagePixels.data[index+7]>>>0).toString(2);


 var tempArray=[...r];
 var tempArray2=[...g];
 var tempArray3=[...b];
 var tempArray4=[...a];
 var tempArray5=[...r2];
 var tempArray6=[...g2];
 var tempArray7=[...b2];
 var tempArray8=[...a2];


 if(index<16)
 {
   if(index<8)
   {
    this.addedZero="01011100";
   }
   else
   {
     this.addedZero="00110000";
   }
 }

 else if(index>=16 && index<80)
 {
   var t=(this.widthHeight.charCodeAt(this.sizeCounter)>>>0).toString(2);

   if(t.length!=8)
   {
     this.addZeros(t);
   }
   else
   {
     this.addedZero=t;
   }
   this.sizeCounter++;
 }
 else
 {
   var image=(hideImagePixels.data[this.counter]>>>0).toString(2);
  
   if(image.length!=8)
   {
     this.addZeros(image);
   }
   else
   {
     this.addedZero=image;
   }
 }
  
 tempArray[tempArray.length-1]=this.addedZero[this.addedZero.length-8];
 tempArray2[tempArray2.length-1]=this.addedZero[this.addedZero.length-7];

 tempArray3[tempArray3.length-1]=this.addedZero[this.addedZero.length-6];
 tempArray4[tempArray4.length-1]=this.addedZero[this.addedZero.length-5];

 tempArray5[tempArray5.length-1]=this.addedZero[this.addedZero.length-4];
 tempArray6[tempArray6.length-1]=this.addedZero[this.addedZero.length-3];

 tempArray7[tempArray7.length-1]=this.addedZero[this.addedZero.length-2];
 tempArray8[tempArray8.length-1]=this.addedZero[this.addedZero.length-1];

 r=tempArray.join('');
 g=tempArray2.join('');
 b=tempArray3.join('');
 a=tempArray4.join('');
 r2=tempArray5.join('');
 g2=tempArray6.join('');
 b2=tempArray7.join('');
 a2=tempArray8.join('');

 var decimal=parseInt(r,2);
 var decimal2=parseInt(g,2);
 var decimal3=parseInt(b,2);
 var decimal4=parseInt(a,2);
 var decimal5=parseInt(r2,2);
 var decimal6=parseInt(g2,2);
 var decimal7=parseInt(b2,2);
 var decimal8=parseInt(a2,2);

 
 if(index==(hideImagePixels.data.length*8))
 {
   break;
 }
 else
 {
   orjImagePixels.data[index]=decimal;
   orjImagePixels.data[index+1]=decimal2;
   orjImagePixels.data[index+2]=decimal3;
   orjImagePixels.data[index+3]=decimal4;
   orjImagePixels.data[index+4]=decimal5;
   orjImagePixels.data[index+5]=decimal6;
   orjImagePixels.data[index+6]=decimal7;
   orjImagePixels.data[index+7]=decimal8;
 }
 this.counter++;
} 
 
ctx.putImageData(orjImagePixels,0,0);
this.user.photo = canvas.toDataURL();

this.dismiss2();
this.uploadImage();

this.counter=0;
this.sizeCounter=0;
}

sendHidePic()
{   
    this.present2();
    this.imageResize();
}


async presentAlertConfirm() {
  const alert = await this.alertController.create({
    cssClass: 'alertControlCss',
    header:'Some pixels may be lost!',
    message: 'The picture resolution is insufficient. Do you want to choose a new picture?',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        handler: () => {
          this.present2();
          this.pipEncode();

        }
        }, {
        text: 'Yes',
        handler: () => {
          this.getImages();
        }
      }
    ]
  });

  await alert.present();
}

async presentPopover(ev: any) {

  if(this.pressPopOverControl==1)
  {
    this.pressPopOverControl=0
    return;
  }
  else
  {

  this.popService.pageControl=2;
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


pressPopOverControl=0;
popOverPan()
{
  this.pressPopOverControl=1
}

async pipPopover(ev: any) {
  if(this.pressPopOverControl==1)
  {
    this.popService.pageControl=5;
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



download()
{
  this.present();
  var request:DownloadRequest={
    uri:this.user.photo,
    title:"",
    description:"",
    mimeType:"image/jpg",
    visibleInDownloadsUi:false,
    notificationVisibility:NotificationVisibility.VisibilityHidden,
    destinationInExternalFilesDir:{
      dirType:"steganography",//dosya konumu
      subPath:`${this.user.pushId}.jpg`,//dosya ismi
    }
  };
  this.downloader.download(request).then((location)=>{
 setTimeout(() => {
   this.readFile();
 }, 200);
  },(err)=>{
    alert(JSON.stringify(err));
  })
}
uls;
async readFile()  {
  const contents = await Filesystem.readFile({
    path: `steganography/${this.user.pushId}.jpg`,
    directory: Directory.External,
  }).then((data)=>{
  this.user.decodeControl=1;
  this.user.photo2=`data:image/jpeg;base64,${data.data}`;
  }).catch((err)=>{
    alert(err);
  });
};

async deleteFile  ()  {
  await Filesystem.deleteFile({
    path: `steganography/${this.user.pushId}.jpg`,
    directory: Directory.External,
  }).then((data)=>{
  }).catch((err)=>{
    alert(err);
  });
};


img;
canvas;
ctx;
pixel;
decodeMessage()
{
   this.img=this.pic.nativeElement;
  this.canvas=<HTMLCanvasElement> document.getElementById("canvas");
  this.ctx=this.canvas.getContext("2d");

  this.ctx.drawImage(this.img,0,0);

   this.pixel=this.ctx.getImageData(0,0,this.width,this.height);

   var control="";
  for (let index = 0; index < 16; index+=8) {

    var r=(this.pixel.data[index]>>>0).toString(2);
    var g=(this.pixel.data[index+1]>>>0).toString(2);
    var b=(this.pixel.data[index+2]>>>0).toString(2);
    var a=(this.pixel.data[index+3]>>>0).toString(2);
    var r2=(this.pixel.data[index+4]>>>0).toString(2);
    var g2=(this.pixel.data[index+5]>>>0).toString(2);
    var b2=(this.pixel.data[index+6]>>>0).toString(2);
    var a2=(this.pixel.data[index+7]>>>0).toString(2);

    var tempArray=[];
    tempArray[0]=r[r.length-1];
    tempArray[1]=g[g.length-1];
    tempArray[2]=b[b.length-1];
    tempArray[3]=a[a.length-1];
    tempArray[4]=r2[r2.length-1];
    tempArray[5]=g2[g2.length-1];
    tempArray[6]=b2[b2.length-1];
    tempArray[7]=a2[a2.length-1];

    var binary=tempArray.join('');

    if(index<8)
    {

      control+=(binary);
    }

    else
    {

      control+=(binary);
    }
  }
   
  if(control=="0101110000110000")
  {
    this.decodePip();
  }
  else if(control=="0000001000101111")
  {
    this.user.decodeControl=2;
    this.decodeTextMessage();
   
  }
  else
  {
    this.dismiss();
    alert("No result!");
    this.user.decodeControl=0;
    this.deleteFile();
  }

}

word="";
charCode()
{
  for (let index = 0; index < this.decodeArray.length; index++) {
    
    //Turkish characters
    if(this.decodeArray[index]=="00000100")
    {
      this.word=this.word+"ı";

    }
    else if(this.decodeArray[index]=="00000101")
    {
      this.word=this.word+"İ";

    }
    else if(this.decodeArray[index]=="00000110")
    {
      this.word=this.word+"ş";
      
    }
    else if(this.decodeArray[index]=="00000111")
    {
      this.word=this.word+"Ş";
      
    }
    else if(this.decodeArray[index]=="00001000")
    {
      this.word=this.word+"ğ";
      
    }
    else if(this.decodeArray[index]=="00001010")
    {
      this.word=this.word+"Ğ";
    }
    else
    {
      this.word=this.word+String.fromCharCode(parseInt(this.decodeArray[index],2));
    }

   }

  this.dismiss();
   this.deleteFile();
}



decodeArray=[];
tempWord="";



decodeTextMessage()
{
  this.decodeArray=[];
  this.counter=0;
  this.tempWord="";

  for (let index = 16; index < this.pixel.data.length; index++) {
    
    var rgbaBinary=((this.pixel.data[index]>>>0).toString(2));
    if(this.tempWord.length==8)
    {
    
     this.decodeArray[this.counter]=this.tempWord;
     if(this.decodeArray[this.counter-1]+this.decodeArray[this.counter]==this.ending)
     {
       this.decodeArray.pop();
       this.decodeArray.pop();
       this.charCode();
       break;
     }
     this.counter++;
     this.tempWord="";
     }

    this.tempWord=this.tempWord+rgbaBinary[rgbaBinary.length-1];
  }
}

decodePip()
{
  this.counter=0;
  var tempWidth="";
  var tempHeight=""; 
  for (let index = 16; index < 80; index+=8) {

    var r=(this.pixel.data[index]>>>0).toString(2);
    var g=(this.pixel.data[index+1]>>>0).toString(2);
    var b=(this.pixel.data[index+2]>>>0).toString(2);
    var a=(this.pixel.data[index+3]>>>0).toString(2);
    var r2=(this.pixel.data[index+4]>>>0).toString(2);
    var g2=(this.pixel.data[index+5]>>>0).toString(2);
    var b2=(this.pixel.data[index+6]>>>0).toString(2);
    var a2=(this.pixel.data[index+7]>>>0).toString(2);

    var tempArray=[];
    tempArray[0]=r[r.length-1];
    tempArray[1]=g[g.length-1];
    tempArray[2]=b[b.length-1];
    tempArray[3]=a[a.length-1];
    tempArray[4]=r2[r2.length-1];
    tempArray[5]=g2[g2.length-1];
    tempArray[6]=b2[b2.length-1];
    tempArray[7]=a2[a2.length-1];
    

    var binary=tempArray.join('');
    var decimal=parseInt(binary,2);


    if(index<48)
    {

    tempWidth+=String.fromCharCode(decimal);
    }

    else
    {

    tempHeight+=String.fromCharCode(decimal);

  }
    
  }
 
   this.newWidth=parseInt(tempWidth);
   this.newHeight=parseInt(tempHeight);


   var canvas2=<HTMLCanvasElement> document.getElementById("canvas2");
   canvas2.width=this.newWidth;
   canvas2.height=this.newHeight;


   var ctx2=canvas2.getContext("2d");

  var imgData = ctx2.createImageData(this.newWidth,this.newHeight);

  for (let index = 64; index < this.pixel.data.length; index+=8) {

    //index =80 ??????
    
    var r=(this.pixel.data[index]>>>0).toString(2);
    var g=(this.pixel.data[index+1]>>>0).toString(2);
    var b=(this.pixel.data[index+2]>>>0).toString(2);
    var a=(this.pixel.data[index+3]>>>0).toString(2);
    var r2=(this.pixel.data[index+4]>>>0).toString(2);
    var g2=(this.pixel.data[index+5]>>>0).toString(2);
    var b2=(this.pixel.data[index+6]>>>0).toString(2);
    var a2=(this.pixel.data[index+7]>>>0).toString(2);
    
    var tempArray=[];
    tempArray[0]=r[r.length-1];
    tempArray[1]=g[g.length-1];
    tempArray[2]=b[b.length-1];
    tempArray[3]=a[a.length-1];
    tempArray[4]=r2[r2.length-1];
    tempArray[5]=g2[g2.length-1];
    tempArray[6]=b2[b2.length-1];
    tempArray[7]=a2[a2.length-1];

    var binary=tempArray.join('');
  
    if((((this.newWidth*this.newHeight)*32))==index)
    {
       break;
    }
    else
    {
      var decimal=parseInt(binary,2);
      imgData.data[this.counter] = decimal;
    }

    this.counter++;

  }
 console.log(imgData);
  ctx2.putImageData(imgData, 0, 0);


   this.user.photo3=canvas2.toDataURL();
  
   this.dismiss();
   setTimeout(() => {
    this.content.scrollToBottom(500);
   }, 100);
  this.deleteFile();
}







  

}
