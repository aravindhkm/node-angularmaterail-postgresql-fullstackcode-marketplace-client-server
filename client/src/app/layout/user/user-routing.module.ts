import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdduserComponent } from './adduser/adduser.component';
import { UserComponent } from './user.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';



const routes: Routes = [
  { path: '', component: UserComponent },
  { path : 'user/add' , component : AdduserComponent},
  { path : 'user/view-profile' , component : ViewProfileComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
