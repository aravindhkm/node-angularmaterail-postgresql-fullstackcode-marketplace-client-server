import { ApiService } from 'src/app/shared/services';
import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor (private apiService: ApiService) { }

   
    getChartData(): Observable <any> {
        let param = "/shared/dashboardReport";
        return this.apiService.get(param);  
      }
      getsublist(id,type,offset): Observable <any> {
        let passOffset = '?page='+offset+'&size=10';
        let params = type == 'list' ? '/subscription'+passOffset : '/subscription/'+id;
            return this.apiService.get(params)      
        }

}
