import { BannerRoutingModule } from './banner-routing.module';
import { BannerService } from './banner.service';
import { BannerComponent } from './banner.component';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {  ModalDialogService } from './../../shared/services/modal-dialog.service';
import {NgxPaginationModule} from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddBannerComponent } from './add-banner/add-banner.component';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG,PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [BannerComponent, AddBannerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BannerRoutingModule,
    PerfectScrollbarModule

  ],
  providers:[BannerService,ModalDialogService,
  {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]


})
export class BannerModule { }
