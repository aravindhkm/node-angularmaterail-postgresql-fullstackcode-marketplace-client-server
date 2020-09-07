import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService} from "../../shared/services/api.service"
@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private apiService: ApiService) { }
  get_bannerlist(id,type,offset,searchParams): Observable <any> {
    let passOffset = '?page='+offset+'&limit=10';
    // let Search ='';
    // if(searchParams)
    // {
    //   let  passSearch = JSON.parse(searchParams);
    //   console.log(passSearch);
    //   Search  = passSearch.searchBar?'&searchTxt='+passSearch.searchBar:'';
      
    // }
    // type = banner
    let setPam = '&type=banner';
    let params = type == 'list' ? '/shared/list'+passOffset+setPam:'/shared/list?bannerId='+id+setPam;
        return this.apiService.get(params)      
    }
   
    delete_bannerlist(id):Observable <any> {
      return this.apiService.delete('/shared/deleteBanner?bannerId='+id)  
    }
    post_bannerlist(Values): Observable <any> { 
      return this.apiService.mulipartPost('/shared/createBanner',Values);     

      }
      put_bannerlist(banValues,id): Observable <any> { 
          return this.apiService.putAd('/shared/createBanner/'+id , banValues)        
      }
      
      
}
