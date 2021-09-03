import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {AngularFireModule} from '@angular/fire'
import {environment} from '../environments/environment';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {HammerModule} from '@angular/platform-browser'
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Downloader } from '@ionic-native/downloader/ngx';
import {HammerGestureConfig,HAMMER_GESTURE_CONFIG,} from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx';


declare var Hammer: any;
@Injectable({providedIn: 'root'})
export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any> {
      'pinch': { enable: false },
      'rotate': { enable: false },
  }
}


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,AngularFireStorageModule,AngularFireAuthModule,AngularFireDatabaseModule,HammerModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },Clipboard,NativePageTransitions,{provide:HAMMER_GESTURE_CONFIG,useClass:MyHammerConfig},Downloader],
  bootstrap: [AppComponent],
})
export class AppModule {}
