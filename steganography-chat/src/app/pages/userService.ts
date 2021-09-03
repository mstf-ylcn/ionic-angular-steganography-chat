import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class userService {

   constructor(){
   }
   
  userArray;
  contactArray;
  chatUId;
  contactName;
  contactEmail;
  contactUserData;
  photo="";
  photoText;

  selectMessagesArray=[];
  selectTextArray=[];
  selectFrom=[];
  decodeControl=0;
  pushId;
  photo2;
  photo3;
  messages=[];
  theme="light";

  newPp;



}