import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services';

@Component({
  selector: 'app-response-rate',
  templateUrl: './response-rate.component.html',
  styleUrls: ['./response-rate.component.css']
})
export class ResponseRateComponent implements OnInit {
  page=1
  itemsPerPage=10
  collection;
  search='';
  srch ='';
  responseRateDatas=[]
  constructor(private apiService:ApiService) { }

  ngOnInit() {
    this.search='';
    this.srch ='';
    this.getResponseRate()
  }
  getResponseRate(){
    
    if(this.search)
    {  
     
       this.srch  ='&searchTxt='+this.search;
      this.page = 1;
    }
    else{
      this.srch ='';
    }
    this.apiService.get('/shared/responses?page=' + this.page + '&limit=' + this.itemsPerPage + this.srch).subscribe(resp=>{
      if(resp && resp.data){
        this.responseRateDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  onChange(event){
    this.page=event
    this.getResponseRate()
  }
  submit(data) {
    this.search = data.search
    this.getResponseRate()
  }
  onReset() {
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getResponseRate()
  }
}
