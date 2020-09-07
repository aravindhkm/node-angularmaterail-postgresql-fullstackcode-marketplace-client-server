import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { UserRoutingModule } from './user/user-routing.module';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
// import { AdduserComponent } from './user/adduser/adduser.component';
// import { UserComponent } from './user/user.component';
import {NgxPaginationModule} from 'ngx-pagination'
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import {UserModule} from './user/user.module';
import { StaticPageComponent } from './static-page/static-page.component';
import { SettingComponent } from './setting/setting.component';
import { ReportsComponent } from './reports/reports.component';
import { ResponseRateComponent } from './response-rate/response-rate.component';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG,PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar'
// import { ModalModule } from 'ngx-bootstrap/modal';
// import { MzRadioButtonModule } from 'ngx-materialize'
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [LayoutComponent,SidebarComponent,NavbarComponent, SettingComponent, ReportsComponent, ResponseRateComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    UserRoutingModule,        
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    UserModule,
    PerfectScrollbarModule
    // MzRadioButtonModule
    // ModalModule.forRoot()

  ],
  exports: [
    LayoutComponent
  ],
  providers:[
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
   
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]

})
export class LayoutModule { }
