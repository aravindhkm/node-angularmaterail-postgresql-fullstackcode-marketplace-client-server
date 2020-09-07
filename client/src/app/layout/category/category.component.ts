import { environment } from 'src/environments/environment';
import { CategoryService } from './category.service';
import { CONSTANTS } from './../../constant/Constant';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import {  ModalDialogService } from '../../shared/services/modal-dialog.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  // animations: [routerTransition()]

})
export class CategoryComponent implements OnInit {
  constants = CONSTANTS;
  noOfpages=1;
  itemsPerPage=10;
  collection;
  categoryLists=[];
  search = ''
  submitted = false
  hideShow = false
  editId;
  isView = false;
  type:'all';
  apiUrl = environment.image_url;
  catpath ;

  constructor(public router: Router,private categoryService: CategoryService,private toastr: ToastrManager,
    private activatedRoute: ActivatedRoute,public modalDialogService:ModalDialogService) {
   this.catpath = this.apiUrl + "/categories/";
  }
  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
      let sessionData = JSON.parse(sessionStorage.getItem('categoryData'));
      // this.search = sessionData && sessionData.search ? sessionData.search : ''
      this.noOfpages = sessionData && sessionData.page ? sessionData.page : 1;
      this.getCategorylist();
    }
    else {
      sessionStorage.removeItem('categoryData');
      this.search = '';
      this.itemsPerPage = 10;
      this.noOfpages = 1;
      this.getCategorylist();
    }
  }
  getCategorylist()
  {
    let getSearch = sessionStorage.getItem("categoryData");
    try {
      this.categoryService.get_categorylist("all",'list',this.noOfpages,getSearch).subscribe(resp => {
     
              if (resp && resp.data.rows.length) {
                 this.collection = resp.data.count;
                 this.categoryLists = resp.data.rows;
              }else{
                this.categoryLists = []
                this.collection = resp.count;
              }
               });
   } catch (error) {
      
   }
  }
  category_addPage(){
    this.router.navigateByUrl('/category/add');
  }
  create(event, id, isView) {
    event.preventDefault();
    this.hideShow = this.hideShow == true ? false : true;
    let obj = {
      "page": this.noOfpages,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('categoryData', JSON.stringify(obj));
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

  searchFilter(data){
    this.noOfpages = 1;
      const getsearchParams = data.search;
      let searchParms :any
        searchParms = {
        "searchBar":getsearchParams,
        "noOfPages":this.noOfpages
       }
       sessionStorage.setItem("categoryData", JSON.stringify(searchParms));
       this.getCategorylist();
  }
  excelExport()
  {

  }
  onReset() {
    sessionStorage.removeItem('categoryData');
    localStorage.removeItem('categoryData');
    this.search = '';
    this.noOfpages = 1;
    this.itemsPerPage = 10;
    this.getCategorylist();
  }
  deleteCat(catId) {
    this.modalDialogService.confirm("CONFIRM", "Are you sure to delete Category", "OKAY", "CANCEL").subscribe(result => {
       
        if (result) {
          this.deleteConfirm(catId);

        }
    });
  }
  deleteConfirm(catId){
    localStorage.removeItem("categoryData");
   
    this.categoryService.delete_categorylist(catId).subscribe(result => {
    if (result && result.status) {
    this.toastr.successToastr("DELETED");
    this.getCategorylist();
    }
    }, error => {
    this.toastr.errorToastr(error);
    });
    }
  onChange(event){
    this.noOfpages=event;
    this.getCategorylist();
    }
    hideShowForm() {
      this.hideShow = this.hideShow == true ? false : true;
      this.getCategorylist();
    }

}
