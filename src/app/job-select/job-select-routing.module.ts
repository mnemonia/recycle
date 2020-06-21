import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobSelectPage } from './job-select.page';

const routes: Routes = [
  {
    path: '',
    component: JobSelectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobSelectPageRoutingModule {}
