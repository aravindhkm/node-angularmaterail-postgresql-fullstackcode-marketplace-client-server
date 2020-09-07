import { environment } from 'src/environments/environment';
import { NavbarService } from './navbar.service';
import { Component, OnInit,ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as io from 'socket.io-client';
import { ModalDialogService } from 'src/app/shared/services';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
    '(document:change)': 'Notification($event)',
  },
}) 
export class NavbarComponent implements OnInit {
  drophideShow = false;
  notificationShoe = false;
  notificationData =[];
  resultTime;
  NotificationDate ;
 
  public url:any;
  public socket:any;
  public notificationList:any;
  public count:any;
  // public subscription: Subscription;
  public notificationCount:any;
  constructor(  public router: Router,private modalDialogService:ModalDialogService,public notificationService:NavbarService ,private _eref: ElementRef) { 
    this.url= environment.socket_url;
  }

  ngOnInit() {
    localStorage.removeItem("NotificationUser");
    localStorage.removeItem("Notification");
    this.notificationListData();
    this.socketIo();
    setInterval(this.msgEmit.bind(this), 10000);

    this.msgEmit();
  }
  msgEmit() {
    this.setSocket();
    this.socket.emit('ARUN');
  }
  setSocket() {
    // this.socket = io("http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:3001");
    this.socket = io(this.url);
  }
  notficationRoute()
  {
    this.notificationShoe = false;
    let obj ={
      readAll:true
    }
    localStorage.setItem("Notification", JSON.stringify(obj));
    this.router.navigateByUrl('/chat')
  }
  socketIo(){
    this.socket = io(this.url);
     let thisVar:any=this;
    this.socket.on("NOTIFICATION_COUNT", function (data:any) {
    if(data)
    {
      console.log(data);
      // thisVar.notificationListData();
    }
    // if(data==0)
    // {          
    //     thisVar.notificationCount='';
    // }
    // else {       
    //     thisVar.notificationCount=data;
    // }
    // if(data){
    //     thisVar.getNotificationList();
    // }
  });
  }
  // messageTimeUpdate()
  //   {
  //       let respDate:any;
   
  //     let notification = localStorage.getItem("Data");
  //     this.currentNotificationData=JSON.parse(notification);
  //     let year1,month1,day1,hour1,minute1,second1,mill1;
  //     let currentDate = new Date();
  //       let year    = currentDate.getFullYear();
  //       let month   = currentDate.getMonth()+1; 
  //       let day     = currentDate.getDate();
  //       let hour    = currentDate.getHours();
  //       let minute  = currentDate.getMinutes();
  //       let second  = currentDate.getSeconds(); 
  //       let mill=currentDate.getMilliseconds();
  //       var current= new Date(year, month, day, hour, minute, second,mill );
  //    if(this.currentNotificationData)
  //    {

  //       this.currentNotificationData.forEach(childObj=> {
  //           respDate=new Date(""+childObj.createdAt);
  //           this.currentdate=childObj.createdAt;
           
  //           year1=respDate.getFullYear();
  //           month1   = respDate.getMonth()+1; 
  //           day1    = respDate.getDate();
  //           hour1    = respDate.getHours();
  //           minute1 = respDate.getMinutes();
  //           second1 = respDate.getSeconds(); 
  //           mill1=respDate.getMilliseconds();
  //           var givenDate= new Date(year1, month1, day1, hour1, minute1, second1,mill1 );
  //           this.timeDifference(current,givenDate);

           
  //          childObj.days=  this.resultTime;
             
  //        });
  //        this.headerService.notificationList=this.currentNotificationData;
  //       }
  //       else {
  //           return;
  //       }
  //   }
  toSettings()
  {
    this.drophideShow = false;
    this.router.navigateByUrl('/setting');

  }
  notificationListData()
  {
    let respDate:any;
    //   let da,da1:any;
    //   let m,m1:any;
    //   let gh,gh1:any;
      let year1,month1,day1,hour1,minute1,second1,mill1;
      let currentDate = new Date();
        let year    = currentDate.getFullYear();
        let month   = currentDate.getMonth()+1; 
        let day     = currentDate.getDate();
        let hour    = currentDate.getHours();
        let minute  = currentDate.getMinutes();
        let second  = currentDate.getSeconds(); 
        let mill=currentDate.getMilliseconds();
        var current= new Date(year, month, day, hour, minute, second,mill);
    try {
      this.notificationService.getNotificationlist("all",'list','').subscribe(resp => {
              if (resp && resp.data.rows.length) {
                 this.notificationData = resp.data.rows;
                 console.log(this.notificationData,"NOTIFY");
                 this.notificationData.forEach(item=>{
                  respDate=new Date(""+item.createdAt);
                  this.NotificationDate=item.createdAt;
                  year1=respDate.getFullYear();
                  month1   = respDate.getMonth()+1; 
                  day1    = respDate.getDate();
                  hour1    = respDate.getHours();
                  minute1 = respDate.getMinutes();
                  second1 = respDate.getSeconds(); 
                  mill1=respDate.getMilliseconds();
                  var givenDate= new Date(year1, month1, day1, hour1, minute1, second1,mill1 );
                  this.timeDifference(current,givenDate);

                  console.log(this.resultTime);
                 })
              }else{
                this.notificationData = []
              }
               });
   } catch (error) {
      
   }
  }
  GetUserRoute(item)
  {
    this.notificationShoe = false;
    let id = item.channelId;
    localStorage.setItem("NotificationUser", JSON.stringify(item));
    this.router.navigateByUrl('/chat/user/'+id)
  }
  onLoggedout() {
    this.modalDialogService.confirm("CONFIRM",'Are you sure, you want to Log Out ?','Ok','Cancel').subscribe(result => {
      if (result) {
        localStorage.clear();
        this.router.navigateByUrl('login')
      }
      else{
        this.drophideShow = this.drophideShow == true ? false : true;
      }
  });
  }
  dropclick(event,val){
    event && event.preventDefault();
    if(val)
    {
      this.notificationShoe = false;
      this.drophideShow = this.drophideShow == true ? false : true;
    }else{
      this.drophideShow = false;
    }

  }
  notificationclick(event,val){
    event && event.preventDefault();
    if(val)
    {
      this.drophideShow = false;
      this.notificationShoe = this.notificationShoe == true ? false : true;
    }
    else {
      this.notificationShoe = false;
    }
  }
  Notification(event)
  {
    console.log('QWED')
    if (!this._eref.nativeElement.contains(event.target)) 
    this.notificationShoe = false;

   
  }
  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target))
    {
      this.drophideShow = false;
      this.notificationShoe = false;
    } 
   
   }
   timeDifference(current, previous) {
    
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    
    var elapsed = current - previous;
    
    if (elapsed < msPerMinute) {
        this.resultTime=Math.round(elapsed/1000) + ' seconds ago';
         return Math.round(elapsed/1000) + ' seconds ago';   
    }
    
    else if (elapsed < msPerHour) {
        this.resultTime=Math.round(elapsed/msPerMinute) + ' minutes ago';
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }
    
    else if (elapsed < msPerDay ) {
        this.resultTime=Math.round(elapsed/msPerHour ) + ' hours ago';

         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        this.resultTime=Math.round(elapsed/msPerDay) + ' days ago'

         return Math.round(elapsed/msPerDay) + ' days ago';   
    }
    
    else if (elapsed < msPerYear) {
        this.resultTime=Math.round(elapsed/msPerMonth) + ' months ago'

         return  Math.round(elapsed/msPerMonth) + ' months ago';   
    }
    
    else {
        this.resultTime= Math.round(elapsed/msPerYear ) + ' years ago';

         return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}
   
}