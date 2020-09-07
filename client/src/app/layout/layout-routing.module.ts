
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { LayoutComponent } from './layout.component';
import { SettingComponent } from './setting/setting.component';
import { ReportsComponent } from './reports/reports.component';
import { ResponseRateComponent } from './response-rate/response-rate.component';

const routes: Routes = [
  {
      path: '',
      component: LayoutComponent,
      children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
          { path: 'user', loadChildren: () => import('./user/user.module').then(module => module.UserModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(module => module.DashboardModule) },
  { path: 'product', loadChildren: () => import('./product/product.module').then(m => m.ProductModule)},
  { path: 'category', loadChildren: () => import('./category/category.module').then(m => m.CategoryModule)},
  { path: 'notification', loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)},
  { path: 'banner', loadChildren: () => import('./banner/banner.module').then(m => m.BannerModule)},


  { path: 'newsletter', loadChildren: () => import('./static-page/static-page.module').then(m => m.StaticPageModule)},
  { path: 'chat', loadChildren: () => import('./chat/chat.module').then(module => module.ChatModule) },
  { path: 'supportmanagement', loadChildren: () => import('./support-system/support-system.module').then(m => m.SupportSystemModule)},
  {path:'setting',component:SettingComponent},
  {path:'report',component:ReportsComponent},
  {path:'responserate',component:ResponseRateComponent}      
      ]
  }
];







@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})


export class LayoutRoutingModule { }

