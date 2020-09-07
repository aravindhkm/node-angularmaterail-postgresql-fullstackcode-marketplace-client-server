import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoryComponent } from './category.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  {
    path: '', component: CategoryComponent,
    
},
{
    path: 'add', component: AddCategoryComponent,
    
},
{
    path: 'edit/:categoryId', component: AddCategoryComponent,
    
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
