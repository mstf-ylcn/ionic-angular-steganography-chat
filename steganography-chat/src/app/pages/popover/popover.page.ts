import { Component, OnInit } from '@angular/core';
import {PopOverService} from '../popoverService';
import {ChatPage} from '../chat/chat.page'
import {SteganographyPage} from '../steganography/steganography.page'
import { NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {

  constructor(private popService:PopOverService,
    private contact:ChatPage,
    private pop:PopoverController,
    private roter:Router,
    private nav:NavController,
    private chatPage:ChatPage,
    private steganographyPage:SteganographyPage,
    private nativePageTransitions:NativePageTransitions) { }

  ngOnInit() {
    this.pageControl=this.popService.pageControl 
  }
  pageControl;
  viewContact()
  {
    this.pop.dismiss();
    this.contact.profil();
  }

  settings()
  {
    this.pop.dismiss();
    let options:NativeTransitionOptions={
      direction:'left',
      duration:300,
    }
    this.nativePageTransitions.slide(options);
    this.roter.navigateByUrl('/settings');
  }

  func()
  {
    this.pop.dismiss();
  }

  deletePhoto()
  {
    console.log("delete photo");
    this.pop.dismiss();

  }

  deleteMessage()
  {
    this.chatPage.presentActionSheet();
    this.pop.dismiss();
  }

  copyMessage()
  {
    this.chatPage.copyText();
    this.pop.dismiss();
  }

  decodeMessage()
  {
    this.chatPage.unshift();
    this.pop.dismiss();
  }

  decodePipMessage()
  {
    this.steganographyPage.download();
    this.pop.dismiss();

  }
  
}
