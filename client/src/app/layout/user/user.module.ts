// import { NavbarComponent } from '../components/navbar/navbar.component';
// import { SidebarComponent } from '../components/sidebar/sidebar.component';

import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';

// import { LayoutComponent } from '../layout.component';
import { AdduserComponent } from '../user/adduser/adduser.component';
import { UserComponent } from '../user/user.component';
import {NgxPaginationModule} from 'ngx-pagination'
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
// import { MzRadioButtonModule } from 'ngx-materialize'
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRoutingModule } from '../user/user-routing.module';
import { ModalDialogService } from './../../shared/services/modal-dialog.service';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG,PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [UserComponent,AdduserComponent, ViewProfileComponent],
  imports: [
    CommonModule,
    UserRoutingModule,        
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,  
    PerfectScrollbarModule
    // MzRadioButtonModule,
    // BrowserAnimationsModule
    // ModalModule.forRoot()

  ],
  providers:[
    ModalDialogService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
   

  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]


})
export class UserModule { }
