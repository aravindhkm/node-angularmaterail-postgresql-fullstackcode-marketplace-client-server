import { AddProductComponent } from './add-product/add-product.component';
import { ProductComponent } from './product.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '', component: ProductComponent
},
{
  path: 'add', component: AddProductComponent
},
{
  path: 'edit/:productID', component: AddProductComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
