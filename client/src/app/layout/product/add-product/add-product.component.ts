import { environment } from './../../../../environments/environment';
import { ProductService } from './../product.service';
import { CONSTANTS } from './../../../constant/Constant';
import { Component, OnInit ,EventEmitter , Input ,Output} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators ,FormArray} from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  productManagementForm: FormGroup;
  constants = CONSTANTS;
  submitted = false;
  categoryLists= [];
  productID;
  userid;
  fileData: File = null;
	imagePreviewUrl: any = null;
  imgUrl;
  result =[];
  prop = false;
  
  @Input() editId: string;
	@Input() isView: boolean;
	@Output() userForm: EventEmitter<any> = new EventEmitter();

  productLabel: boolean = false;
  constructor(public router: Router,  private fb: FormBuilder, private productService: ProductService, private toastr: ToastrManager, private activatedRoute: ActivatedRoute) {
    this.imgUrl = environment.image_url
   
  }
 
  ngOnInit() {
		if (this.editId) {
			this.productID = this.editId
		}
		this.productManagementForm = this.fb.group({
      productProperty: this.fb.array([]) ,
      productName: ['', [Validators.required]],
      categoryID: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      productQuantity: ['', [Validators.required]],
      productPrice: ['', [Validators.required]],
      images: ['']
    })
    this.prop = false;
		if (this.productID) {
			this.getProductEditList();
    }
    this.getCats();
    this.userid=localStorage.getItem("UserId");
  }
  changeEditPage() {
		this.isView = false;
		this.getProductEditList();
  }
  listPath() {
		this.userForm.emit();
  }
  deleteImage()
  {
    this.fileData = null;
	   this.imagePreviewUrl= '';
      this.imgUrl ='';
  }


  getProductEditList()
  {   
      this.getCats();
      let formGroups =[];
      this.productService.get_productlist(this.productID, 'edit', '','','')
      .subscribe(resp => {
        if (resp) {
          this.result =  resp.data.rows[0].propertyJson && resp.data.rows[0].propertyJson;
          if(this.result)
          {
             formGroups = this.result.map(x => this.fb.group({
              name: this.fb.control(x.name),
              value: this.fb.control(x.value),
            }));
          }
          this.productManagementForm = this.fb.group({
            productProperty:this.fb.array(formGroups),
            productName: [resp.data.rows[0].productName, [Validators.required]],
            categoryID: [resp.data.rows[0].categoryId, [Validators.required]],
            location: [resp.data.rows[0].location, [Validators.required]],
            description: [resp.data.rows[0].description, [Validators.required]],
            productQuantity: [resp.data.rows[0].quantity, [Validators.required]],
            productPrice: [resp.data.rows[0].price, [Validators.required]],
            images: [resp.data.rows[0].imageName]
          }
          );
          this.imagePreviewUrl = this.imgUrl + '/products/images/' + resp.data.rows[0].imageName
        
        }
    
      });
  }
  productProperty() : FormArray {
    return this.productManagementForm.get("productProperty") as FormArray
  }
   
  newQuantity(): FormGroup {
    return this.fb.group({
      name: '',
      value: '',
    })
    
  }
   
  addQuantity() {
    this.prop = false;
    this.productProperty().push(this.newQuantity());
  }
   
  removeQuantity(i:number) {
    this.productProperty().removeAt(i);
  }
  get check() { return this.productManagementForm.controls; }
  getCats(){
    try {
       this.productService.getCategory().subscribe(resp => {
               if (resp && resp.data.length) {
                  this.categoryLists = resp.data;
               }
                });
    } catch (error) {
        // this.spinner.hide();
        // this.toastr.error(this.translate.instant("error"));
    }
}
fileProgress(fileInput: any) {
  this.fileData = <File>fileInput.target.files[0];

  var mimeType = this.fileData.type;
  if (mimeType.match(/image\/*/) == null) {
    return;
  }
  var reader = new FileReader();
  reader.readAsDataURL(this.fileData);
  reader.onload = (_event) => {
    this.imagePreviewUrl = reader.result;
    this.productManagementForm.value.images = '';
  }
  fileInput.target.value ='';
}
restrictSpace(e){ 

  //  if(!e.target.value){
    var k = e ? e.which : e.target.keyCode;
    if (k == 32) return false;
  //  }
  //  if(e.target.name=="quantity" || e.target.name=="price" || e.target.name=="proValue"){
    // return (e.charCode > 64 && e.charCode < 91) || (e.charCode > 96 && e.charCode < 123) || e.charCode == 32;  
  //  } 
  }
  getCategories(catId)
  {
    var results;
    this.categoryLists.map(function(val, index){ 
      if(catId == val.id)
      {
        results = val.name;
      }
    })
    return results;
  }
onSubmit() {
   
  let productParams = {}
  
  // this.submitted = true;
  let param ={};
  const proValues = this.productManagementForm.value;
  let flag = false;
  if(proValues.productProperty && proValues.productProperty.length>0)
  {
    let checkProperty = proValues.productProperty;
    for(var i=0;i<checkProperty.length;i++)
    {
        if(!checkProperty[i].name || !checkProperty[i].value)
        {
          flag = true;
        }
    }
  }
  this.submitted = true;
  if (this.productManagementForm.valid && !flag && proValues.productProperty.length>0 && this.imagePreviewUrl) 
  {
    var formData = new FormData();
    const proValues = this.productManagementForm.value;
    // let product = {
    //     'size':proValues.productSize,
    //     'color':proValues.productColor,
       
    // }
    

   
    if (!this.productID) {

      productParams = {
        'userId':this.userid,
        'categoryId': proValues.categoryID,
        'productName': proValues.productName.trim(),
        'location':proValues.location,
        'description': proValues.description,
        'propertyJson':proValues.productProperty,
        'quantity': proValues.productQuantity,
        'price': proValues.productPrice
      }
      formData.append('productData', JSON.stringify(productParams));
      formData.append("productImage", this.fileData);
      this.productService.post_productlists(formData).subscribe(resp => {
        if (resp && resp.status) {
          this.toastr.successToastr('Product Added Sucessfully');
         this.listPath();
        }
        else {
          this.toastr.errorToastr("Product Not Added");
        }
      }, err => {
       
       
        this.toastr.errorToastr('Error');
      });
    } else {
      productParams = {
        'productId':this.productID,
        'userId':this.userid,
        'categoryId': proValues.categoryID,
        'productName': proValues.productName.trim(),
        'location':proValues.location,
        'description': proValues.description,
        'propertyJson':proValues.productProperty,
        'quantity': proValues.productQuantity,
        'price': proValues.productPrice
      }
      formData.append('productData', JSON.stringify(productParams));
      if (!this.fileData) {
        formData.append("productImage", proValues.images);
      }
       else {
        formData.append("productImage", this.fileData);
      }
      this.productService.post_productlists(formData).subscribe(resp => {
        if (resp && resp.status) {
          this.toastr.successToastr('Product Updated Sucessfully');
          this.listPath();
        } else {
          this.toastr.errorToastr("ERROR");
        }
      }, err => {
        console.log(err)
        this.toastr.errorToastr("Error")
      });
    }
  } else {
   
    
    if(proValues.productProperty.length>=1 && flag)
    {
      this.toastr.errorToastr("Enter Value and Name for Product Property");
    }
    return;
  }
}
 

}
