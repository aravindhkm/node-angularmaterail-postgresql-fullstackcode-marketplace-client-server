import { CONSTANTS } from './../../../constant/Constant';
import { NotificationService } from './../notification.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
@Component({
  selector: 'app-add-notification',
  templateUrl: './add-notification.component.html',
  styleUrls: ['./add-notification.component.css']
})
export class AddNotificationComponent implements OnInit {
  @Input() editId: string;
	@Input() isView: boolean;
	@Output() notificationForm: EventEmitter<any> = new EventEmitter();
	submitted = false;
  Notificationid;
  constants = CONSTANTS;
	NotificationAddForm: FormGroup

  constructor(private fb: FormBuilder,private toastr: ToastrManager,public notificationService:NotificationService) { }

  ngOnInit() {
		if (this.editId) {
			this.Notificationid = this.editId
		}
		this.NotificationAddForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
     
		})
		if (this.Notificationid) {
			this.getNotificationEdit();
		}
  }
  getNotificationEdit()
  {

  }
  changeEditPage() {
		this.isView = false;
		this.getNotificationEdit();
	}
  listPage() {
    // 
  }
  get check() { return this.NotificationAddForm.controls; }
  restrictSpace(event) {
		if (!event.target.value) {
			event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
		}
  }
  OnSubmit()
  {

  }

}
