import { BannerComponent } from './banner.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddBannerComponent } from './add-banner/add-banner.component';

const routes: Routes = [
  {
    path: '', component: BannerComponent,
    
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BannerRoutingModule { }
