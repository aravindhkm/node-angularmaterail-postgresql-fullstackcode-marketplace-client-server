import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../shared/services'
// 'src/app/services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDialogService } from '../../shared/services/modal-dialog.service'
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  page = 1
  itemsPerPage = 10
  collection
  userDatas = []
  search = ''
  submitted = false
  modalRef: BsModalRef;
  hideShow = false
  editId;
  isView = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private toastr: ToastrManager,
    private apiService: ApiService, private modalService: BsModalService, public modalDialogService: ModalDialogService ) { }

  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
      let sessionData = JSON.parse(sessionStorage.getItem('userSessionData'))
      this.search = sessionData && sessionData.search ? sessionData.search : ''
      this.page = sessionData && sessionData.page ? sessionData.page : 1
      this.getUserList()
    }
    else {
      sessionStorage.removeItem('userSessionData')
      this.search = ''
      this.itemsPerPage = 10
      this.page = 1
      this.getUserList()
    }
  }
  excelExport()
  {
    let searchText = '';
    let page = '';
    let exportClicked=true;
    let UserDatas =[];
    if (this.search) {
      searchText = '&searchTxt=' + this.search
    }else{
      page = '&page=' +this.page
    }
    this.apiService.get('/users/list?limit=' + this.itemsPerPage +page +'&type=export'+searchText).subscribe(resp => {
      if (resp) {
        UserDatas = resp.data.rows;
        const options = {
                            fieldSeparator: ',',
                            quoteStrings: '"',
                            decimalSeparator: '.',
                            showLabels: true,
                            showTitle: true,
                            title:'User Detail',
                            useTextFile: false,
                            useBom: false,
                            // useKeysAsHeaders: true,
                            filename:'User',
                            headers: ['Name','Mobile','Email','Role Name']
                            };
                            let formatData=[]
                             UserDatas && UserDatas.map((item)=>{
                              let FirstName = item.userName ? item.userName : ''
                              let Mobile = item.mobile ? item.mobile : 'null'
                              let Email = item.email ? item.email : 'null'
                              let RoleName = item.roleName ? item.roleName : ''

                              let obj={
                              FirstName:FirstName,
                              Mobile:Mobile,
                              Email:Email,
                              RoleName:RoleName
                              }
                              formatData.push(obj)
                              })
                            const csvExporter = new ExportToCsv(options);
                            csvExporter.generateCsv(formatData);
                          this.toastr.successToastr("Sucess");
       
      }
    }, err => {
     
        this.toastr.errorToastr('API Failed')
      
});


    
  }

  getUserList() {
    let searchText = '';
    let page = '';
    if (this.search) {
      searchText = '&searchTxt=' + this.search
      this.page = 1
    }else{
      page= '&page='+ this.page 
    }
    this.apiService.get('/users/list?limit=' + this.itemsPerPage +page+ searchText).subscribe(resp => {
      if (resp) {
        this.userDatas = resp.data.rows
        this.collection = resp.data.count
      }
    }, err => {
     
        this.toastr.errorToastr('API Failed')
     
});
  }
  create(event, id, isView) {
    event.preventDefault();
    this.hideShow = this.hideShow == true ? false : true;
    let obj = {
      "page": this.page,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('userSessionData', JSON.stringify(obj))
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
  }

  onChange(event) {
    this.page = event
    this.getUserList()
  }

  submit(data) {
    this.search = data.search
    this.getUserList()
  }
  onReset() {
    sessionStorage.removeItem('userSessionData')
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getUserList()
  }

  delete(id) {
    this.modalDialogService.confirm("Confirm Delete", "Do you really want to delete ?", "Yes Delete", "No, Keep it").subscribe(result => {
      if (result) {
        this.apiService.delete('/users/deleteUser?userId=' + id).subscribe(resp => {
          if (resp.status) {
            this.toastr.successToastr(resp.message)
            this.getUserList()
          }
        }, err => {
          let errors = err;
          
            this.toastr.errorToastr('API Failed')
       
    });
      }
    })
  }
  ActiveUser(event,id,status) {
    event.preventDefault();
    this.modalDialogService.confirm("Verify Status", "Do you really want to update the status ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        let obj = {
          userId: id,
          type: 'status',
          status: status
        }
        this.apiService.post('/users/updateStatus', obj).subscribe(resp => {
          if (resp.status) {
            this.toastr.successToastr(resp.message)
            this.getUserList()
          }
        }, err => {
          let errors = err;
          
            this.toastr.errorToastr('API Failed')
          
    });
      }else{
        this.getUserList()
      }
    })
  }

  blockUser(event,id,status) {
    event.preventDefault();
    this.modalDialogService.confirm("Confirm Block", "Do you really want to update the status ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        let obj = {
          userId: id,
          type: 'block',
          status: status
        }
        this.apiService.post('/users/updateStatus', obj).subscribe(resp => {
          if (resp.status) {
            this.toastr.successToastr(resp.message)
            this.getUserList()
          }
        }, err => {
          let errors = err;
          
            this.toastr.errorToastr('API Failed')
         
    });
      }else{
        this.getUserList()
      }
    })
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg modal-dialog-centered' });
  }

  hideShowForm() {
    this.hideShow = this.hideShow == true ? false : true;
  }
}

