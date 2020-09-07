import { StaticPageComponent } from './static-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddStaticPageComponent } from './add-static-page/add-static-page.component';

const routes: Routes = [
  {
    path: '', component: StaticPageComponent
},
{
    path: 'add', component: AddStaticPageComponent
},
{
  path:'edit/:id',component:AddStaticPageComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticRoutingModule { }
