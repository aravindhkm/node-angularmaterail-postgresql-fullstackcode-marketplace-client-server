import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService} from "../../shared/services/api.service";
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor (private apiService: ApiService) {}
  get_productlist(id,type,offset,searchParm,exClicked): Observable <any> {
    let passOffset = '?page='+offset+'&limit=10';
    let Search ='';
    let exports='';
    let setDefault='';
    if(exClicked)
    {
      exports  = '&type=export';
    }
    else{
      setDefault = '&type=all';
    }
    if(searchParm)
    {
      let  passSearch = JSON.parse(searchParm);
      Search  = passSearch.searchBar?'&searchTxt='+passSearch.searchBar:'';
      
    }
    let joins = passOffset+Search+exports+setDefault;
    let params = type == 'list' ? '/products/list'+joins: '/products/list?productId='+id;
    let pam ='/products/list';
        return this.apiService.get(params)      
    }
    getCategory(): Observable <any> {
          let params='/categories/getCategories';
          return this.apiService.get(params)      
      }
    post_productlist(params):Observable <any> {
      return this.apiService.post('/products/create',params)  
    }
    put_productlist(params,id):Observable <any> {
      return this.apiService.put('/products/'+id,params)  
    }
    postblockProduct(params):Observable <any> {
      return this.apiService.post('/products/updateStatus',params)  
    }
    delete_productitem(id):Observable <any> {
      return this.apiService.delete('/products/deleteProduct?productId='+id)  
    }
    post_productlists(Values): Observable <any> { 
      return this.apiService.mulipartPost('/products/create',Values);     

      }
      put_productlists(proValues,id): Observable <any> { 
          return this.apiService.putAd('/products/create/'+id ,proValues)        
      }
}
