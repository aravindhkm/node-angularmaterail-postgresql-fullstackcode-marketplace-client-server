import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import {ApiService} from '../../../shared/services/api.service'
import { environment } from "src/environments/environment";
import { BsModalService, BsModalRef} from 'ngx-bootstrap/modal';
// import { TabsetComponent } from 'ngx-bootstrap/tabs';



@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent implements OnInit {

 page=1
  itemsPerPage=2
  collection
  userDatas=[]
  search=''

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private toastr:ToastrManager,
    private apiService:ApiService,private modalService: BsModalService){ }

  ngOnInit(): void {
  }
  getUserList(){
    this.apiService.get('/users/list?page=' + this.page + '&limit=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp=>{
      if(resp){
        this.userDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
}
