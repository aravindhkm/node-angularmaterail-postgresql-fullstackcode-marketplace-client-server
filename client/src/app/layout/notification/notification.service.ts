import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { ApiService} from "../../shared/services/api.service";
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor (private apiService: ApiService) { }

    getNotificationlist(id,type,offset): Observable <any> {
    let passOffset = '?page='+offset+'&limit=10';
    let setOf = '?type=notification&userId=1';
    let params = type == 'list' ? '/shared/list'+setOf : '/shared/list='+id;
        return this.apiService.get(params)      
    }
    getUserlist(id,type,offset): Observable <any> {
      let passOffset = '?page='+offset+'&limit=10';
      let setOf = '?type=notification&userId=1';
      let params = type == 'list' ? '/users/list'+passOffset : 'users/list'+id;
          return this.apiService.get(params)      
      }
    postNotificationData(params):Observable <any> {
      return this.apiService.post('/shared/createNotification',params)  
    }
    putNotificationData(params,id):Observable <any> {
      return this.apiService.put('/shared/'+id,params)  
    }
    deleteNotificationData(id):Observable <any> {
      return this.apiService.delete('/shared/?dashh='+id)  
    }

}
