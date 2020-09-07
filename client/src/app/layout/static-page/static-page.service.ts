import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService} from "../../shared/services/api.service";
@Injectable({
  providedIn: 'root'
})
export class StaticPageService {
  constructor (private apiService: ApiService) {}
  getStaticPageList(Data):Observable<any>{
    let params='/shared/list?type=' + Data.type + '&page=' + Data.page + '&limit=' + Data.limit
    return this.apiService.get(params)
  }
  createTemplate(Data):Observable<any>{
      return this.apiService.post('/shared/createTemplate',Data)
  }
  deleteTemplate(id):Observable<any>{
      return 
  }
  getSpecificTemplate(id):Observable<any>{
      return this.apiService.get('/shared/list?type=template&templateId=' + id )
  }
}
