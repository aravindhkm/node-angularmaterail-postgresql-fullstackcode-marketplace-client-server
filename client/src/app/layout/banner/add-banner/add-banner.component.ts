import { BannerService } from './../banner.service';
import { CONSTANTS } from './../../../constant/Constant';
import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { environment } from '../../../../environments/environment';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
  selector: 'app-add-banner',
  templateUrl: './add-banner.component.html',
  styleUrls: ['./add-banner.component.css']
})
export class AddBannerComponent implements OnInit {
  @Input() editId: string;
	@Input() isView: boolean;
	@Output() bannerForm: EventEmitter<any> = new EventEmitter();
  fileData: File = null;
  previewUrl: any = null;
  bannerManagementForm: FormGroup;
  bannerId ;
  constants=CONSTANTS;
  submitted = false;
  imagePreviewUrl: any = null;
  imgUrl;
  bannerImage;
  constructor(private fb: FormBuilder,private toastr: ToastrManager,public bannerService:BannerService ) { 
    this.imgUrl = environment.image_url;
  }

  
  listPage()
  {
  this.bannerForm.emit();
  }
  get check() { return this.bannerManagementForm.controls; }
  ngOnInit() {
		if (this.editId) {
			this.bannerId = this.editId
		}
    this.bannerManagementForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: ['', [Validators.required]]
		})
		if (this.bannerId) {
			this.getBannerEditList();
		}
	}

  changeEditPage() {
		this.isView = false;
		this.getBannerEditList();
	}
  getBannerEditList()
  {
    try{
    this.bannerService.get_bannerlist(this.bannerId,'edit','','').subscribe(resp=>{
      if(resp)
      {
        this.bannerManagementForm = this.fb.group({
          name:[resp.data.rows[0].name,[Validators.required]],
          description:[resp.data.rows[0].description,[Validators.required]],
          image:['',[Validators.required]]
          });
          this.imagePreviewUrl = this.imgUrl + '/banners/' + resp.data.rows[0].imageName;
          this.bannerImage =resp.data.rows[0].imageName;
      }
    }, err => {
      let error = err;
      if(error.statusText == 'Unknown Error')
      {
          this.toastr.errorToastr('Avoid Ad Blocker')
       }
    });
  }catch(error)
  {
    if(error.statusText == 'Unknown Error')
    {
    }

  }
    
  }
  addBanner() {
    let bannerParams = {}
    this.submitted = true;  
    if (this.bannerManagementForm.valid && this.imagePreviewUrl) 
    {
      var formData = new FormData();
      const bannerValues = this.bannerManagementForm.value;
     
     
      if (!this.bannerId) {
        bannerParams = {
          'name': bannerValues.name.trim(),
          'description': bannerValues.description,
        }
        formData.append('bannerData', JSON.stringify(bannerParams));
        formData.append('bannerImage', this.fileData);
        this.bannerService.post_bannerlist(formData).subscribe(resp => {
          if (resp && resp.status) {
            this.toastr.successToastr("Banner Added");
          this.listPage();
          }
          else {
            this.toastr.errorToastr("Not Added")
          }
        }, err => {
          this.toastr.errorToastr(err.error.message)
        });
      } else {
        bannerParams = {
          'name': bannerValues.name.trim(),
          'description': bannerValues.description,
          'bannerId':this.bannerId
        }
        formData.append('bannerData', JSON.stringify(bannerParams));
        if(!this.fileData)
        {
          formData.append('bannerImage', this.bannerImage);
        }
        else{
          formData.append('bannerImage', this.fileData);
        }
        this.bannerService.post_bannerlist(formData).subscribe(resp => {
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
      this.bannerManagementForm.value.image = '';
    }
    fileInput.target.value ='';
  }
  deleteImage()
  {
    this.fileData = null;
	  this.imagePreviewUrl= '';
    this.imgUrl ='';
  }


  getProductEditList()
  {   
     
      this.bannerService.get_bannerlist(this.bannerId, 'edit', '','')
      .subscribe(resp => {
        if (resp) {
         
          this.bannerManagementForm = this.fb.group({
          
            productName: [resp.data.rows[0].productName, [Validators.required]],
            categoryID: [resp.data.rows[0].categoryId, [Validators.required]],
            
          }
          );
          this.imagePreviewUrl = this.imgUrl + '/banner/' + resp.data.rows[0].imageName
        
        }
    
      });
  }
}
