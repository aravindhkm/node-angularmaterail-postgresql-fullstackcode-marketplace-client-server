import { ModalDialogService } from './../../shared/services/modal-dialog.service';
import { ProductService } from './product.service';
import { CONSTANTS } from './../../constant/Constant';
import { Component, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  
  // animations: [routerTransition()]
})
export class ProductComponent implements OnInit {
  noOfpages = 1;
  itemsPerPage = 10;
  collection;
  productList = [];
  search = '';
  submitted = false;
  hideShow = false;
  editId;
  catValue=[];
  isView = false;
  constants = CONSTANTS;
  productPageSearchForm: FormGroup;


 
  constructor(private toastr: ToastrManager ,public router: Router,private productService :ProductService,private fb: FormBuilder,public modalDialogService : ModalDialogService) { 

   
  }   
  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
    
      let sessionData = JSON.parse(sessionStorage.getItem('productData'));
      // this.search = sessionData && sessionData.search ? sessionData.search : '';
      this.noOfpages = sessionData && sessionData.page ? sessionData.page : 1;
      this.getProductlist();
    }
    else {
      sessionStorage.removeItem('productData');
      this.search = '';
      this.itemsPerPage = 10;
      this.noOfpages = 1;
      this.getcatList();
      this.getProductlist();
    }
   

  }
  getcatList()
  {
    this.productService.getCategory().subscribe(resp=>{
      
      this.catValue= resp.data;
    
    
  })
  }
  getCategories(catId)
  {
    var results;
    this.catValue.map(function(val, index){ 
      if(catId == val.id)
      {
        results = val.name;
      }
    })
    return results;
  }
  excelExport()
  {
    let exportClicked=true;
    let searchParms :any = '';
    let dummy =null;
    if(this.search)
    {
      searchParms = {
      "searchBar":this.search
     }
     dummy =JSON.stringify(searchParms);

    }
    
    let getSearch = dummy;
    let ProductDats =[];
    try {
      this.productService.get_productlist("all",'list','',getSearch,exportClicked).subscribe(resp => {
    
              if (resp && resp.data.rows.length) {
                ProductDats = resp.data.rows;
                // ProductDats.forEach(item => {
                  
                  ProductDats.map(function(entry) {
                    let id =entry.productName;
                    let obj =[];
                    let dataaa =[];
                    dataaa=entry.propertyJson;
                   
                    if(dataaa)
                    {
                      if(dataaa.length>0)
                      {
                        for(var i=0;i<dataaa.length;i++)
                        {
                                let t = dataaa[i].name +':'+dataaa[i].value;
                                obj.push(t);
          
                         }
                         let val = obj.join(',');
                 
                         entry.propertyJson = val;
                      
                      }
                      else{
                        entry.propertyJson = null;
                      }
                    
                    }     
                   

                    
                    // entry.propertyJson = stData;
                  });
                 
           
                const options = {
                  fieldSeparator: ',',
                  quoteStrings: '"',
                  decimalSeparator: '.',
                  showLabels: true,
                  showTitle: true,
                  title:'Product',
                  useTextFile: false,
                  useBom: false,
                  // useKeysAsHeaders: true,
                  filename:'Product',
                  headers: ['Product Name','Description','Location','Price','Property','Quantity','Status']
                  };
                  let formatData=[]
                  ProductDats && ProductDats.map((item)=>{
                  let obj={
                  ProductName:item.productName,Description:item.description,Location:item.location,Price:item.price,Property:item.propertyJson
                  ,Quantity:item.quantity,Status:item.status
                  }
                  formatData.push(obj)
                  })
                  const csvExporter = new ExportToCsv(options);
                  csvExporter.generateCsv(formatData);
                this.toastr.successToastr("CSV File Exported");
              
              }else{
                ProductDats = [];
                this.toastr.errorToastr("Zero Products");
               
              }
              });
  } catch (error) {
      
}
    
  }
  searchFilter(data){
    this.noOfpages = 1;
      const getsearchParams = data.search;
      this.search=getsearchParams;
      let searchParms :any
        searchParms = {
        "searchBar":getsearchParams,
        "noOfPages":this.noOfpages
       }
      
       sessionStorage.setItem("productData", JSON.stringify(searchParms));
      //  localStorage.setItem("pageSess", this.noOfpages.toString());
  
       this.getProductlist();
  }
  create(event, id, isView,sts) {
    if(!sts)
    {
    event.preventDefault();
  
    this.hideShow = this.hideShow == true ? false : true;
    let obj = {
      "page": this.noOfpages,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('productData', JSON.stringify(obj))
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
  else{
    this.toastr.errorToastr("Product Blocked");  

  }
  }

  onChange(event) {
    this.noOfpages = event;
   
    this.getProductlist();
  }

  updateProduct(e,type,id)
  {
      this.modalDialogService.confirm("Please Confirm","Change Product Status","OKAY", "CANCEL").subscribe(result => {
        if (result) {
            this.update(e,type,id);
        }
        else
        {
            this.getProductlist();
        }
    });
   
  }
  update(e,type,id){
    let params = {};
    params ={
      'productId':id,
      'isBlock':e.target.checked
    }
   
    this.productService.postblockProduct(params).subscribe(resp=>{
        if(resp && resp.status){
          this.toastr.successToastr("Updated Sucessfully");
            this.getProductlist();
        }else{
            this.toastr.errorToastr("Error");  
        }
    })
  }
  hideShowForm() {
    this.hideShow = this.hideShow == true ? false : true;
    this.getProductlist();
  }
  onReset() {
     
    localStorage.removeItem('productData');
    sessionStorage.removeItem('productData');
  
      this.search = '';
      this.noOfpages = 1;
      this.itemsPerPage = 10;
      this.getProductlist();
  }
  submit(data) {
    // this.search = data.search
    this.getProductlist()
  }
  getProductlist()
  {
    let getSearch = sessionStorage.getItem("productData");
          try {
            this.productService.get_productlist("all",'list',this.noOfpages,getSearch,'').subscribe(resp => {
          
                    if (resp && resp.data.rows.length) {
                      this.collection = resp.data.count;
                      this.productList = resp.data.rows;
                    
                    }else{
                      this.productList = []
                      this.collection = resp.count;
                    }
                    });
        } catch (error) {
            
   }
   }
   deleteProduct(proid)
    {
        if(proid) {
        this.modalDialogService.confirm("Please Confirm", "Are you sure to want Delete Product", "OKAY", "CANCEL").subscribe(result => {
        if (result) {
        this.deleteConfirm(proid);
        }
        });
        }
    }
   deleteConfirm(proId)
   {
          this.productService.delete_productitem(proId).subscribe(result => {
          if (result && result.status) {
          this.toastr.successToastr("Product Deleted Sucessfully");
          this.getProductlist();
          }
          }, error => {
          this.toastr.errorToastr(error);
          });
    }
      
  
    
 
   
    
      
     
}
