import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService} from "../../shared/services/api.service"
@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }
  get_categorylist(id,type,offset,searchParams): Observable <any> {
    let passOffset = '?page='+offset+'&limit=10';
    let Search ='';
    if(searchParams)
    {
      let  passSearch = JSON.parse(searchParams);
      Search  = passSearch.searchBar ? '&searchTxt='+passSearch.searchBar : '';
      
    }
    let params = type == 'list' ? '/categories/list'+passOffset+Search:'/categories/list?categoryId='+id;
    
        //  let params='categories/list';
        return this.apiService.get(params)      
    }
    // post_categorylist(params):Observable <any> {
    //   return this.apiService.post('/subscription',params)  
    // }
    // put_categorylist(params,id):Observable <any> {
    //   return this.apiService.put('/subscription/'+id,params)  
    // }
    delete_categorylist(id):Observable <any> {
      return this.apiService.delete('/categories/deleteCategory?categoryId='+id)  
    }
    post_categorylist(Values): Observable <any> { 
      return this.apiService.mulipartPost('/categories/create',Values);     

      }
      put_categorylist(catValues,id): Observable <any> { 
          return this.apiService.putAd('/categories/create/'+id , catValues)        
      }
      
      
}
