import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../shared/services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-support',
  templateUrl: './view-support.component.html',
  styleUrls: ['./view-support.component.css']
})
export class ViewSupportComponent implements OnInit {
	submitted = false
	id;
	fileData: File = null;
	imagePreviewUrl: any = null;
	imgUrl;
	viewSupportData: FormGroup
	constructor(private activatedRoute: ActivatedRoute, private router: Router, private fb: FormBuilder,
		private toastr: ToastrManager,private location: Location,
		private api: ApiService) {
		this.imgUrl = environment.image_url
	}
	ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.id = params.id ? params.id : ''
    })

		this.viewSupportData = this.fb.group({
			userName: [''],userId:[''],
			email: ['', ], address: ['', ],
			phoneNumber: ['', ],type: ['', ],
			name: ['', ],message: ['',Validators.required]
		})
		if (this.id) {
			this.getEditList();
		}
	}

	restrictSpace(event) {
		if (!event.target.value) {
			event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
		}
	}

	getEditList() {
		this.api.get('/shared/list?type=support'+ "&supportId=" + this.id).subscribe(resp => {
			if (resp && resp.status && resp.data && resp.data.rows) {
				let respData = resp.data.rows[0];
				this.viewSupportData = this.fb.group({
					name: [respData.name], userName: [respData.User.userName],userId: [respData.User.id], email: [respData.User.email],
          address: [respData.description], phoneNumber: [respData.User.mobile],	
          type: [respData.type] ,message: [respData.description,Validators.required]		  
				})
			}
		}, err => {
			this.toastr.errorToastr(err.error.message);
		})
	}

	listPath() {
    this.location.back();
	}
	get f() {
		return this.viewSupportData.controls
	}

	onSubmit() {
		this.submitted = true
		let formValues = this.viewSupportData.value
		if (formValues.message && this.viewSupportData.valid) {

			let params = {
				"userId": formValues.userId.toString(),	
				"supportId" : this.id,
				"type":	formValues.type,
				"name":formValues.name,
				"description":formValues.message
			}
		
			this.api.post('/shared/createSupport', params).subscribe(resp => {
				if (resp && resp.status) {
					this.toastr.successToastr(resp.message);
				}
			}, err => {
				// err.error.errors[0].path == 'firstName' ? this.toastr.errorToastr('Name must be required') : err.error.errors[0].path == 'email' ? this.toastr.errorToastr(err.error.errors[0].message) :
				// this.toastr.errorToastr('Mandatory fields are missing (or) invalid');
			})
		} else {
			this.toastr.errorToastr("message required");
		}
	}
}

