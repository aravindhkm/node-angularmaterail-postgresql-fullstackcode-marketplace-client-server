import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  appStatus
  constructor(private apiService:ApiService,private toastr:ToastrManager) { }

  ngOnInit() {
    this.getSettings()
  }
  getSettings(){
    this.apiService.get('/shared/list?type=setting').subscribe(resp=>{
      if(resp && resp.data){
        let value=resp.data.rows && resp.data.rows[1]
        this.appStatus=value.status
      }
    })
  }
  updateStatus(event){
    let obj={
      'status':event.target.checked,
      'settingId':1
    }
    this.apiService.post('/shared/updateStatus',obj).subscribe(resp=>{
      if(resp && resp.status){
        this.toastr.successToastr(resp.message)
      }
    })
  }
}