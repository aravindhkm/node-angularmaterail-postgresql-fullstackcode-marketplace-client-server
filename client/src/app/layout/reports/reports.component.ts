import { Component, OnInit } from '@angular/core';
import { ApiService, ModalDialogService } from 'src/app/shared/services';
import { ToastrManager } from 'ng6-toastr-notifications';
import * as moment from 'moment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  searchFilter=''
  reportDatas=[]
  collection
  itemsPerPage=10
  page=1;
  reportType:any ='';
  reportContent:any ='';
  reportStatus:any='';
  constructor(private apiService:ApiService,private toastr:ToastrManager,private modalService:ModalDialogService) { }

  ngOnInit() {
      this.getReport()
  }
  onSelect(event){
    this.searchFilter=event.target.value
    this.reportDatas=[]
    this.getReport()
  }
  onStatusChange(status,id,type){
    let message=status == 'block' ? "Are you sure you to update status ?" : "Are you sure you to ignore ?"
    this.modalService.confirm("Stauts Update",message,"Ok","Cancel").subscribe(resp=>{
      if(resp){
    let obj={
      'status':status,
      'reportId':id.toString(),
      'type':type
    }
    let mapId=''
    this.reportDatas.forEach((item)=>{
      if(id == item.id){
      mapId = type == 'user' ? item.User && item.User.id : item.Product && item.Product.id
      }
    })
    type == 'user' ? obj['userId']= mapId : obj['productId'] = mapId
    
    this.apiService.post('/shared/updateStatus',obj).subscribe(resp=>{
      if(resp && resp.status){
        this.toastr.successToastr(resp.message)
        this.getReport()
      }
    })
  }
})
  }
  onChange(event){
    this.page=event
    this.getReport()
  }
  getReport(){
    this.apiService.get('/shared/list?type=report&searchTxt=' + this.searchFilter  + '&page=' + this.page + '&limit=' + this.itemsPerPage).subscribe(resp=>{
      if(resp && resp.data){
        this.reportDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }

  close()
  {
    let myDialog:any = <any>document.getElementById("myDialog");
    myDialog.close();
   
  }
  openReportDetail(data)
  {
    if(data)
    {
      this.reportType=data.reportType;
      this.reportContent=data.description;
      let givendate =data.createdAt;
      let date = moment(givendate.createdAt).format('D/M/YYYY, h:mm a')
      let dateTime = date && date.split(",")
       this.reportStatus= dateTime;
      let myDialog:any = <any>document.getElementById("myDialog");
      myDialog.showModal();
    }
   
  }
}