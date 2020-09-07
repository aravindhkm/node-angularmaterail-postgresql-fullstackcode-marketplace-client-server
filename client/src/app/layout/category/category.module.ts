import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './category.component';
import { CategoryService } from './category.service';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {  ModalDialogService } from './../../shared/services/modal-dialog.service';
import {NgxPaginationModule} from 'ngx-pagination'

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddCategoryComponent } from './add-category/add-category.component';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG,PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [AddCategoryComponent,CategoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CategoryRoutingModule,
    NgxPaginationModule,
    PerfectScrollbarModule

  ],
  providers:[
    CategoryService,ModalDialogService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
   

  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]


})
export class CategoryModule { }
