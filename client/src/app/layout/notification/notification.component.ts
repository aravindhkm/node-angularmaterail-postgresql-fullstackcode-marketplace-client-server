import { CONSTANTS } from './../../constant/Constant';
import { NotificationService } from './notification.service';
import { ModalDialogService } from 'src/app/shared/services';
import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  noOfpages = 1;
  itemsPerPage = 10;
  collection;
  notificationData = []
  submitted = false;
  hideShow = false;
  editId;
  isView = false;
  delarr=[];
  newArray=[];
  selected_rows;
  constants =CONSTANTS;
  notifyData;
  NotificationAddForm: FormGroup;
  isChecked = false;
  userid;

  @ViewChild('myCheck') myCheck: ElementRef;

  constructor(private toastr: ToastrManager,public modalDialogService: ModalDialogService,public notifactionService:NotificationService,public fb:FormBuilder) { }

  ngOnInit(): void {
    this.NotificationAddForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
       type: ['', [Validators.required]],
       
        });
        this.userid=localStorage.getItem("UserId");
        sessionStorage.removeItem("SUsers");


    this.getUserData();
  }
  get check() { return this.NotificationAddForm.controls; }
 
  create(event, id, isView) {
    event.preventDefault();
    this.hideShow = this.hideShow == true ? false : true;
    let obj = {
      "page": this.noOfpages,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('NotificationData', JSON.stringify(obj))
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
  OnSubmit()
  {
    const credentials = this.NotificationAddForm.value;
    this.submitted = true;
    
     if (this.NotificationAddForm.valid) {
				let params = {
					"userId":this.userid,
          "toUserId":this.delarr,
          "title":credentials.title,
          "description":credentials.description,
          "type":credentials.type, 
        }
        try{
         
        this.notifactionService.postNotificationData(params).subscribe(resp=>{
          if(resp && resp.status){
            this.toastr.successToastr("Notification Sent Successfully");
            this.notificationData.map(function(entry) {
              entry.checked = false;
              return entry;
            });
            this.delarr=[];
            this.close();
          
          }else{
            this.toastr.errorToastr("NOT UPDATED");
          }
        }, err => {
					console.log(err)
          this.toastr.errorToastr("ERROR");
				});
              
      }
      catch (error) {
        
        this.toastr.errorToastr("ERROR");
     }
    }else{
      return; 
    }
}

  onChange(event) {
    
   
    this.noOfpages = event;
    this.getUserData();
  }
  getUserData()
  {
    try {
      this.notifactionService.getUserlist("all",'list',this.noOfpages).subscribe(resp => {
     
              if (resp && resp.data.rows.length) {
                 this.collection = resp.data.count;
                 this.notificationData = resp.data.rows;
                 let back =[];
                 let dm =JSON.parse(sessionStorage.getItem("SUsers"));
                 console.log(back);
                 if(back.length>=0 && dm==null)
                 {
                      this.notificationData.map(function(entry) {
                                      entry.checked = false;
                                      return entry;
                                    });
                 }
                 else{
                
                  for(var d in dm)
                  {
                     back.push(dm[d]);
                  }
                     back.forEach(item => {
                      this.notificationData.map(function(entry) {
                        if(entry.id == item)
                        {
                          entry.checked = true;
                        }
                        return entry;
                      });
                   
                  });
                 }
               
                
              }else{
                this.notificationData = []
                this.collection = resp.count;
              }
               });
   } catch (error) {
      
   }
  }
  getNotificationDatalist()
  {
    try {
      this.notifactionService.getNotificationlist("all",'list',this.noOfpages).subscribe(resp => {
     
              if (resp && resp.data.rows.length) {
                 this.collection = resp.data.count;
                 this.notificationData = resp.data.rows;
              }else{
                this.notificationData = []
                this.collection = resp.count;
              }
               });
   } catch (error) {
      
   }
  }
  hideShowForm() {
    this.hideShow = this.hideShow == true ? false : true;
  }
  checkbox(item)
  {
   
    if(this.delarr.find(x=>x==item))
    {
    this.delarr.splice(this.delarr.indexOf(item),1);
    this.notificationData.map(function(entry) {
      if(entry.id == item)
      {
      entry.checked = false;
      }
      return entry;
     });
    sessionStorage.setItem('SUsers',JSON.stringify(this.delarr));
    }
    else{
    this.delarr.push(item);
    this.notificationData.map(function(entry) {
      if(entry.id == item)
      {
      entry.checked = true;
      }
      return entry;
     });
    sessionStorage.setItem('SUsers',JSON.stringify(this.delarr));
    }
   

  }
 
  
  unselectAll()
  {
    sessionStorage.removeItem("SUsers");
    this.delarr=[];
    this.notificationData.map(function(entry) {
      entry.checked = false;
      return entry;
    });
  }
  getCheckboxValues(ev, data) {
    let obj = {
      "order": data
    }
    let selected_rows = [];

    if (ev.target.checked) {
      // Pushing the object into array
      this.newArray.push(obj);
    } else {
      let el = this.newArray.find(itm => itm.order === data);

      if (el)
        this.newArray.splice(this.newArray.indexOf(el), 1);
      if (this.newArray.length == 0) {
        this.newArray = [];
      }
    }
    if (this.newArray.length > 0) {
      for (let i in this.newArray) {
        selected_rows.push(this.newArray[i].order.bulkid);

        this.selected_rows = selected_rows;
      }
    }
  }
  sendNotificationMessage(temp)
  {
    
    if(this.delarr.length>=0 && this.delarr.length>0)
    {
      this.NotificationAddForm = this.fb.group({
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
         type: ['', [Validators.required]],
         
          });
      let myDialog:any = <any>document.getElementById("myDialog");
      myDialog.showModal();
      this.NotificationAddForm.get('title').clearValidators();
      this.NotificationAddForm.get('description').clearValidators();
      this.NotificationAddForm.get('type').clearValidators();
    }
    else{
      this.toastr.errorToastr("Select Atleast one User");
      }
    //  var instance = M.Modal.getInstance(elem);
    
  }
  close()
  {
    let myDialog:any = <any>document.getElementById("myDialog");
    myDialog.close();
    this.submitted = false;
    this.NotificationAddForm.get('title').clearValidators();
    this.NotificationAddForm.get('description').clearValidators();
    this.NotificationAddForm.get('type').clearValidators();
  }
}
