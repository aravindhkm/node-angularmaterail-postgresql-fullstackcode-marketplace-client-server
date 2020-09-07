import { NotificationComponent } from './notification.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddNotificationComponent } from './add-notification/add-notification.component';
const routes: Routes = [
  {
    path: '', component: NotificationComponent,
    
},
{
    path: 'add', component: AddNotificationComponent,
    
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }
