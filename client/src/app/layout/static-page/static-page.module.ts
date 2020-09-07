import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination'
import {  ModalDialogService } from './../../shared/services/modal-dialog.service';
import { StaticRoutingModule} from './static-page-routing.module'
import { StaticPageComponent } from './static-page.component';
import { AddStaticPageComponent } from './add-static-page/add-static-page.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [StaticPageComponent, AddStaticPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    StaticRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AngularEditorModule
  ],
  providers:[ModalDialogService],

})
export class StaticPageModule { }
