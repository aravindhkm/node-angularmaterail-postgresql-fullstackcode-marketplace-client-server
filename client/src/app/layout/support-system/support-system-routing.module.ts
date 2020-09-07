import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportSystemComponent } from './support-system.component';
import {ViewSupportComponent} from './view-support/view-support.component'

const routes: Routes = [
  { path: '', component: SupportSystemComponent },
  { path: 'view-support/:id', component: ViewSupportComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportSystemRoutingModule { }
