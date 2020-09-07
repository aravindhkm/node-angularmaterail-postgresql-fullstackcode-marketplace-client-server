import { CONSTANTS } from './../../../constant/Constant';
import { CategoryService } from './../category.service';
import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { environment } from '../../../../environments/environment';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  @Input() editId: string;
	@Input() isView: boolean;
	@Output() categoryForm: EventEmitter<any> = new EventEmitter();
  catLabel: boolean = false;
  fileData: File = null;
  previewUrl: any = null;
  categoryManagementForm: FormGroup;
  categoryId ;
  constants=CONSTANTS;
  submitted = false;
  imagepath ;
  imagename;
  imagename1;

  constructor(private fb: FormBuilder,private toastr: ToastrManager,private activatedRoute: ActivatedRoute,public router: Router,public categoryService:CategoryService) { 
    this.imagepath = environment.image_url + '/categories/';
  }
 
  ngOnInit() {
		if (this.editId) {
			this.categoryId = this.editId
		}
		this.categoryManagementForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      catImage: [''],
      type: ['', [Validators.required]]
		})
		if (this.categoryId) {
			this.getCategoryEditList();
		}
	}

  get check() { return this.categoryManagementForm.controls; }
  changeEditPage() {
		this.isView = false;
		this.getCategoryEditList();
	}

	restrictSpace(event) {
		if (!event.target.value) {
			event.target.value == "" && event.which == 32 ? event.preventDefault() : '';
		}
  }
  onSelect(event){

  }
  getCategoryEditList()
  {
    this.categoryService.get_categorylist(this.categoryId,'edit','','').subscribe(resp=>{
      if(resp)
      {
        this.categoryManagementForm = this.fb.group({
          title:[resp.data.rows[0].name,[Validators.required]],
          description:[resp.data.rows[0].description,[Validators.required]],
          catImage:[''],
          type:[resp.data.rows[0].type,[Validators.required]]
          });
          this.previewUrl =this.imagepath + resp.data.rows[0].imageName;
          this.imagename=resp.data.rows[0].imageName
      }
    })
  }
 
  addCategory() {
    let categoryParams = {}
    this.submitted = true;  
    if (this.categoryManagementForm.valid && this.previewUrl) 
    {
      var formData = new FormData();
      const categoryValues = this.categoryManagementForm.value;
     
     
      if (!this.categoryId) {
        categoryParams = {
          'name': categoryValues.title.trim(),
          'description': categoryValues.description,
          'type':categoryValues.type
        }
        formData.append('categoryData', JSON.stringify(categoryParams));
        formData.append('categoryImage', this.fileData);
        this.categoryService.post_categorylist(formData).subscribe(resp => {
          if (resp && resp.status) {
            this.toastr.successToastr("Category Added");
          this.listPage();
          }
          else {
            this.toastr.errorToastr("Not Added")
          }
        }, err => {
          this.toastr.errorToastr(err.error.message)
        });
      } else {
        categoryParams = {
          'name': categoryValues.title.trim(),
          'description': categoryValues.description,
          'categoryId':this.categoryId,
          'type':categoryValues.type
        }
        formData.append('categoryData', JSON.stringify(categoryParams));
        this.fileData ? formData.append('categoryImage', this.fileData) : formData.append('categoryImage', this.imagename)
        this.categoryService.post_categorylist(formData).subscribe(resp => {
          if (resp && resp.status) {
            this.toastr.successToastr(resp.message);
            this.listPage();
          }
        }, err => {
          this.toastr.errorToastr(err.error.message)
        });
      }
    } else {
      return;
    }
  }
listPage()
{
  this.categoryForm.emit();
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
		  this.previewUrl = reader.result;
		  // this.categoryManagementForm.controls['catImage'].setValue(this.previewUrl)
    }
    fileInput.target.value ='';
 }
 deleteImage(){
   this.previewUrl=''
  //  this.categoryManagementForm.controls['catImage'].setValue('')
}
}