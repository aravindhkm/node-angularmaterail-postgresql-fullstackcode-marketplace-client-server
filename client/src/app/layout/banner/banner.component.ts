import { ModalDialogService } from './../../shared/services/modal-dialog.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BannerService } from './banner.service';
import { CONSTANTS } from './../../constant/Constant';
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  constants = CONSTANTS;
  noOfpages=1;
  itemsPerPage=10;
  collection;
  bannerLists=[];
  search = ''
  submitted = false
  hideShow = false
  editId;
  isView = false;
  type:'all';
  apiUrl = environment.image_url;
  catpath ;
  constructor(public bannerService:BannerService ,private toastr: ToastrManager,
   public modalDialogService:ModalDialogService) {
    this.catpath = this.apiUrl + "/banners/";
  }

  ngOnInit(): void {
    sessionStorage.removeItem('bannerData');
    this.search = '';
    this.itemsPerPage = 10;
    this.noOfpages = 1;
    this.getBannerlist();
  }

  create(event, id, isView) {
    event.preventDefault();
    this.hideShow = this.hideShow == true ? false : true;
    let obj = {
      "page": this.noOfpages,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('bannerData', JSON.stringify(obj));
    if (id) {
      this.editId = id;
    } else {
      this.editId = '';
    }
    if (isView) {
      this.isView = true;
    } else {
      this.isView = false;
    }
  }
  getBannerlist()
  {
    let getSearch = sessionStorage.getItem("bannerData");
    try {
      this.bannerService.get_bannerlist("all",'list',this.noOfpages,getSearch).subscribe(resp => {
     
              if (resp && resp.data.rows.length) {
                 this.collection = resp.data.count;
                 this.bannerLists = resp.data.rows;
              }else{
                this.bannerLists = [];
                this.collection = resp.count;
              }
               });
   } catch (error) {
      
   }

  }
  hideShowForm() {
    this.hideShow = this.hideShow == true ? false : true;
    this.getBannerlist();
  
  }
  deleteCat(catId) {
    this.modalDialogService.confirm("CONFIRM", "you sure to delete this banner", "OKAY", "CANCEL").subscribe(result => {
       
        if (result) {
          this.deleteConfirm(catId);

        }
    });
  }
  deleteConfirm(catId){
    localStorage.removeItem("bannerData");
   
    this.bannerService.delete_bannerlist(catId).subscribe(result => {
    if (result && result.status) {
    this.toastr.successToastr("DELETED");
    this.getBannerlist();
    }
    }, error => {
    this.toastr.errorToastr(error);
    });
    }


}
