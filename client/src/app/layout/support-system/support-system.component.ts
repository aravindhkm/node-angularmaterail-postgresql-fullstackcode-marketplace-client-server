import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../shared/services'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDialogService } from '../../shared/services/modal-dialog.service'

@Component({
  selector: 'app-support-system',
  templateUrl: './support-system.component.html',
  styleUrls: ['./support-system.component.scss']
})
export class SupportSystemComponent implements OnInit {
  page = 1
  itemsPerPage = 10
  collection
  supportDatas = []
  search = ''
  submitted = false
  modalRef: BsModalRef;
  hideShow = false
  editId;
  isView = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private toastr: ToastrManager,
    private apiService: ApiService, private modalService: BsModalService, public modalDialogService: ModalDialogService, ) { }

  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
      let sessionData = JSON.parse(sessionStorage.getItem('supportSessionData'))
      this.search = sessionData && sessionData.search ? sessionData.search : ''
      this.page = sessionData && sessionData.page ? sessionData.page : 1
      this.getSupportList()
    }
    else {
      sessionStorage.removeItem('supportSessionData')
      this.search = ''
      this.itemsPerPage = 10
      this.page = 1
      this.getSupportList()
    }
  }

  getSupportList() {
    let searchText = '';
    let page = "";
    if (this.search) {
      searchText = '&searchTxt=' + this.search
      this.page = 1
    }else{
      page = '&page=' +  this.page
    }
    this.apiService.get('/shared/list?'+ 'limit=' + this.itemsPerPage + page + '&type=support'+ searchText).subscribe(resp => {
      if (resp) {
        this.supportDatas = resp.data.rows
        this.collection = resp.data.count
      }
    })
  }
  create(event, id, isView) {
    event.preventDefault();
    let obj = {
      "page": this.page,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('supportSessionData', JSON.stringify(obj))
    if (id) {
      this.editId = id
    } else {
      this.editId = ''
    }
    if (isView) {
      this.isView = true;
    } else {
      this.isView = false;
    }
    this.router.navigateByUrl( 'supportmanagement/view-support/' + id)

  }

  onChange(event) {
    this.page = event
    this.getSupportList()
  }

  submit(data) {
    this.search = data.search
    this.getSupportList()
  }
  onReset() {
    sessionStorage.removeItem('supportSessionData')
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getSupportList()
  }

  statusChange(event,id,status) {
    event.preventDefault();
    this.modalDialogService.confirm("Confirm Block", "Do you really want to update status ?", "Yes", "No").subscribe(result => {
      if (result) {
        let obj = {
          supportId: id.toString(),
          // type: status,
          status: status == "pending" ? "completed" : "pending"
        }
        this.apiService.post('/shared/updateStatus', obj).subscribe(resp => {
          if (resp.status) {
            this.toastr.successToastr(resp.message)
            this.getSupportList()
          }
        })
      }else{
        this.getSupportList();
      }
    })
  }

}