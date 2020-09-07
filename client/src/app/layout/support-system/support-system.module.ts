import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportSystemRoutingModule } from './support-system-routing.module';
import { SupportSystemComponent } from './support-system.component';

import {NgxPaginationModule} from 'ngx-pagination'
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ModalDialogService } from './../../shared/services/modal-dialog.service';
import { ViewSupportComponent } from './view-support/view-support.component';

@NgModule({
  declarations: [SupportSystemComponent, ViewSupportComponent],
  imports: [
    CommonModule,
    SupportSystemRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers:[ModalDialogService]
})
export class SupportSystemModule { }
