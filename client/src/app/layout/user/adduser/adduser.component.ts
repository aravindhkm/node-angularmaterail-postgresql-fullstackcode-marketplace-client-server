import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../shared/services/api.service'
import { environment } from "src/environments/environment";
import PerfectScrollbar from 'perfect-scrollbar';


@Component({
	selector: 'app-adduser',
	templateUrl: './adduser.component.html',
	styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
	@Input() editId: string;
	@Input() isView: boolean;
	@Output() userForm: EventEmitter<any> = new EventEmitter();
	@Output() userList: EventEmitter<any> = new EventEmitter();
	staffRoute = false
	submitted = false
	id;
	fileData: File = null;
	imagePreviewUrl: any = null;
	imgUrl;
	createUserForm: FormGroup
	constructor(private activatedRoute: ActivatedRoute, private router: Router, private fb: FormBuilder,
		private toastr: ToastrManager,
		private api: ApiService) {
		this.imgUrl = environment.image_url
	}
	ngOnInit() {
		if (this.editId) {
			this.id = this.editId
		}
		this.createUserForm = this.fb.group({
			userName: ['', Validators.pattern('^[a-zA-Z \-\']+')], firstName: ['', Validators.required],
			email: ['', Validators.required], address: ['', Validators.required],
			phoneNumber: ['',Validators.required], password: ['', Validators.required],
			gender: ['', Validators.required], role: ['', Validators.required], images: ['']
		})
		if (this.id) {
			this.getEditList();
			this.createUserForm.controls['password'].disable();

		}
	}

	changeEditPage() {
		this.isView = false;
		this.getEditList();
	}

	restrictSpace(event) {
		if (!event.target.value) {
			event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
		}
	}

	getEditList() {
		this.api.get('/users/list?' + "userId=" + this.id).subscribe(resp => {
			if (resp && resp.status && resp.data && resp.data.rows) {
				let respData = resp.data.rows[0];
				// this.name = respData.userName;
				this.createUserForm = this.fb.group({
					userName: [respData.userName, Validators.required], firstName: [respData.firstName ? respData.firstName:respData.userName, Validators.required], email: [respData.email, Validators.required],
					address: [respData.address, Validators.required], phoneNumber: [respData.mobile, Validators.required],
					password: [{value:respData.password.substring(0, 8),disabled: true}, Validators.required], gender: [respData.gender, Validators.required], role: [respData.roleName, Validators.required], images: [respData.userImage]
				})
				this.imagePreviewUrl = this.imgUrl + '/users/' + respData.userImage
				this.createUserForm.controls['password'].disable();

			}
		}, err => {
			console.log(err,"ERROR")
			this.toastr.errorToastr(err.message);
		})
	}

	listPath() {
		this.userForm.emit();
	}
	get f() {
		return this.createUserForm.controls
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
			this.createUserForm.value.images = '';
		}
		fileInput.target.value ='';
	}
	deleteImage(){
		if(this.imagePreviewUrl){
			this.fileData = null;
	   		this.imagePreviewUrl= null;
			  this.imgUrl ='';
			  this.createUserForm.patchValue({images:''});
			  this.toastr.successToastr("Image Removed")
		}
  }

	onSubmit() {
		this.submitted = true
		let formValues = this.createUserForm.value
		if (formValues.phoneNumber.length == 10 &&
			 (formValues.images || this.fileData) && this.createUserForm.valid) {

			let params = {
				"userId": this.id,
				"userName": formValues.userName,
				"firstName": formValues.firstName.trim(),
				"email": formValues.email.toLowerCase(),
				"address": formValues.address.trim(),
				"mobile": formValues.phoneNumber,
				"gender": formValues.gender,
				"roleName": formValues.role,
				"password":formValues.password
			}
			// if (!this.id) {
			// 	params['password'] = 
			// }

			let paramsData = new FormData();
			if (this.createUserForm.value.images) {
				paramsData.append("profileImage", formValues.images);
			} else {
				paramsData.append("profileImage", this.fileData);
			}

			paramsData.append("userData", JSON.stringify(params));
			this.api.mulipartPost('/users/create', paramsData).subscribe(resp => {
				if (resp && resp.status) {
					this.toastr.successToastr(resp.message);
					this.userForm.emit();
					this.userList.emit()
				}
			}, err => {
				this.toastr.errorToastr("Email/UserName number already exists");
				// err.error.errors[0].path == 'firstName' ? this.toastr.errorToastr('Name must be required') : err.error.errors[0].path == 'email' ? this.toastr.errorToastr(err.error.errors[0].message) :
				// this.toastr.errorToastr('Mandatory fields are missing (or) invalid');
			})

		} else {
			if(formValues.phoneNumber.length != 10)
			{
				this.toastr.errorToastr("Enter Valid Mobile Number");

			}
			else {
				this.toastr.errorToastr("Mandatory Fields are Missing or Invalid");

			}
		}
	}
}
