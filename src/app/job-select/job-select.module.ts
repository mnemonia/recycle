import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobSelectPageRoutingModule } from './job-select-routing.module';

import { JobSelectPage } from './job-select.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobSelectPageRoutingModule
  ],
  declarations: [JobSelectPage]
})
export class JobSelectPageModule {}
