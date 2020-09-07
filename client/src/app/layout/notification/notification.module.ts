import { NotificationService } from './notification.service';
import { NotificationRoutingModule } from './notification-routing.module';
import { AddNotificationComponent } from './add-notification/add-notification.component';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {  ModalDialogService } from './../../shared/services/modal-dialog.service';
import {NgxPaginationModule} from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification.component'
// import {MaterializeModalModule} from 'materialize-angular';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [NotificationComponent,AddNotificationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NotificationRoutingModule,
    // MaterializeModalModule
    
   
  ],
  providers:[ModalDialogService,NotificationService],
//   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]


})
export class NotificationModule { }
