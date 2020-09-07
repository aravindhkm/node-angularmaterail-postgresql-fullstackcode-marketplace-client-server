import { LoaderService } from './shared/services/loader.service';
import { ApiService } from './shared/services/api.service';
import { AuthGuard } from './shared/guard/auth.guard';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ng6-toastr-notifications';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalComponent } from './shared/modals/modals.component';
import {NgxPaginationModule} from 'ngx-pagination';
// import {UserModule} from './layout/user/user.module'
import { LayoutModule } from './layout/layout.module';
import { LoginModule } from './login/login.module';
import { NgHttpLoaderModule } from 'ng-http-loader';
import {ModalDialogService} from './shared/services/modal-dialog.service'
const routes: Routes = [
	{ path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule),canActivate: [AuthGuard] },
	{ path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
	{ path: 'support-system', loadChildren: () => import('./layout/support-system/support-system.module').then(m => m.SupportSystemModule) },//canActivate: [AuthGuard] 
  
  ];
@NgModule({
	declarations: [AppComponent,ModalComponent],
	imports: [BrowserModule, FormsModule,ReactiveFormsModule,BrowserAnimationsModule,
		ToastrModule.forRoot(),
		HttpClientModule,AppRoutingModule,LayoutModule,LoginModule,
		NgHttpLoaderModule.forRoot(),NgxPaginationModule,
		ModalModule.forRoot(),RouterModule.forRoot(routes,{useHash: true})

	],
	providers: [AuthGuard,ApiService,LoaderService],
	bootstrap: [AppComponent],
	entryComponents:[ModalComponent]
})
export class AppModule { }
