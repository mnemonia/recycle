import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {SubscriptionService} from './services/subscribe/subscription.service';
import {JobsService} from './services/job/jobs.service';
import {PaymentService} from './services/payment/payment.service';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {GeoService} from './services/geo/geo.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RecyclingMapService} from './services/recycling-map/recycling-map.service';
import {MathService} from './services/math/math.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
      HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
      HttpClient,
    JobsService,
    SubscriptionService,
      PaymentService,
      RecyclingMapService,
    GeoService,
      MathService,
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
