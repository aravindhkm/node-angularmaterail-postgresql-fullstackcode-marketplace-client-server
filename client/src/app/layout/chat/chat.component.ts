import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../shared/services'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// import { ModalDialogService } from '../../shared/services/modal-dialog.service'
import * as io from 'socket.io-client';
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment'
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  page = 1
  itemsPerPage = 10
  collection
  channelDatas = []
  chatDatas = []
  search = ''
  msg = ''
  submitted = false
  modalRef: BsModalRef;
  editId;
  public socket: any;
  messageText: string;
  messages: Array<any>;
  userId ;
  channelId = ''
  loginUserId ;
  offerData = [] as any;
  chatEmit;
  USERNAME='';
  CMPNAME ='';
  productID='';
  NotificationItem :any;
  checkFlag=false;
  socket_url ;
  imgUrl;
  userimage:any='';
  // socket;

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private toastr: ToastrManager,
    private apiService: ApiService, private modalService: BsModalService,
  ) {
    this.socket_url = environment.socket_url
    this.imgUrl = environment.image_url+'/users/'
    this.setSocket();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.NotificationItem = params['item'];
    });

  }

  setSocket() {
    // this.socket = io("http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:3001");
    this.socket = io(this.socket_url);
  }

  ngOnInit() {
    this.loginUserId = JSON.parse(localStorage.getItem("UserId"));

    this.getChannelList()
    this.checkMsg();
    setInterval(this.msgEmit.bind(this), 10000);

    const singleUser = JSON.parse(localStorage.getItem("NotificationUser"));
    const allUser = JSON.parse(localStorage.getItem("Notification"));
    if(this.NotificationItem && singleUser)
    {
        // this.getChats('',data,true)
        console.log(singleUser.id);
        this.changetoReadStatus(this.NotificationItem ,singleUser)
    }
    else if(allUser)
    {
        console.log(this.loginUserId);
        this.changeAlltoRead(this.loginUserId)
    }
    else {
      this.checkFlag = true;
      console.log(this.checkFlag);
    }
   
    
  }
  changeAlltoRead(userid)
  {
   let obj ={
   
      userId:userid,
      type:'notification',
      status:"read",
    }
    this.apiService.post('/shared/updateStatus',obj).subscribe(resp=>{
      if(resp && resp.status){
        // this.toastr.successToastr(resp.message)
        console.log(resp);
     
      }
    });
    this.checkFlag = true;
    localStorage.removeItem('Notification');
  }
  changetoReadStatus(id,data)
  {
      let obj ={
        notifyId:id,
        status:"read",
      }
    this.apiService.post('/shared/updateStatus',obj).subscribe(resp=>{
      if(resp && resp.status){
        // this.toastr.successToastr(resp.message)
        this.getChats('',data,true);
        console.log(resp);
      }
    })
    localStorage.removeItem('NotificationUser');
  }
  checkMsg() {
    this.msgEmit();
    // this.chatEmit = setInterval(() => {
    //   if (this.channelId) {
    //     this.msgEmit();
    //   }
    // }, 10000)
  }


  ngOnDestroy() {
    clearInterval(this.chatEmit);
  }

  getChannelList() {
    let searchText = '';
    if (this.search) {
      searchText = 'searchTxt=' + this.search
    }
    this.channelDatas=[]
    this.apiService.get('/chats/getChannels?' + searchText).subscribe(resp => {
      if (resp && resp.data && resp.data.rows) {
        this.channelDatas = resp.data.rows;
        this.collection = resp.data.count;
        let firstUser = resp.data.rows[0];
        console.log(firstUser);
        if(this.checkFlag)
        {
          this.getChats('',firstUser,true);
        }

      }
    })
  }

  sendMsg(data) {    
    this.msg = data.msg;
    console.log(data,"DATASSSSSSSSS")
    if(!this.channelId){
      this.toastr.errorToastr("Please Select profile to chat");
      return
    }
    if(data.msg == ""){
      this.toastr.errorToastr("Please Enter any message");
      return
    }
    let obj = {
      channelId: this.channelId,productId:this.productID, userId:this.loginUserId, toUserId:this.userId, chatType: "chat", message: data.msg
    }
  
    this.socket.emit('CHANNEL_CHAT', obj);
    this.msg = ''
    console.log(obj ,"SEND DATAAAA")
     this.msgEmit();
  }


  msgEmit() {
    this.setSocket();
    let notify_socket = `CHATS_${this.channelId}`;
    console.log(notify_socket,"NOTIFY SOCKET")
    let thisVar: any = this;
    this.socket.on(notify_socket, function (data, fn) {
     console.log(data,"DATAAAA");
      if (data && data.chatData) {
        let chatDatas = thisVar.chatDatas;
        console.log("DataDataData", data.chatData);
        const found = chatDatas.some(el => el.id === data.chatData.id);
        if(!found){
          chatDatas.push(data.chatData)
          thisVar.chatDatas = chatDatas
        }
      }
    });
  }

  getSearchList(data) {
    this.search = data.search
    this.getChannelList();
  }
  getChatsFromID()
  {
    
  }
  getChats(event, data, dataIndex) {
    if(event)
    {
      event.preventDefault();
    }
    if(data)
    {
    this.userId = data.userId;
    console.log(this.userId,"IDDDDDD")
    console.log(data,"GET USER DATA")
    this.channelId = data.id;
    console.log(data);
    this.productID = data.productId;
    this.CMPNAME = data.name;
    let userdata =data.User;
    let image = data.User.userImage ? this.imgUrl + data.User.userImage :'';
    this.userimage = image;
    this.USERNAME = userdata.userName;
    console.log(this.USERNAME);
    this.channelDatas.map((item, index) => {
      if (dataIndex == index) {
        item.isSelected = true
      } else {
        item.isSelected = false
      }
    })
    this.offerData = [];
    this.chatDatas = [];
    this.apiService.get('/chats/list?channelId=' + data.id).subscribe(resp => {

      if (resp && resp.data) {
        this.chatDatas = resp.data && resp.data.chatData.reverse()

        let offerData = []
        resp.data && resp.data.offerData && resp.data.offerData.map(offerItem => {
          let obj = offerItem
          resp.data && resp.data.userData && resp.data.userData.map(item => {
            if (obj.userId == item.id) {
              obj['userName'] = item.userName;
              obj['roleName'] = item.roleName;
              obj['userStatus'] = item.status;
              if (obj && obj.createdAt) {
                let date = moment(obj.createdAt).format('D/M/YYYY, h:mm a')
                let dateTime = date && date.split(",")
                obj['offerDate'] = dateTime && dateTime[0];
                obj['offerTime'] = dateTime && dateTime[1];
              }
              offerData.push(obj);
             
              console.log(this.USERNAME);
            }
          })

        })
        this.offerData = offerData;

      }
    })
  }else {
    this.toastr.errorToastr("Data Not Found");
  }
    
  }
  create(event, id) {
    event.preventDefault();
    let obj = {
      "page": this.page,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('supportSessionData', JSON.stringify(obj))
    if (id) {
      this.editId = id
    } else {
      this.editId = ''
    }
    this.router.navigateByUrl('supportmanagement/view-support/' + id)
  }

  onChange(event) {
    this.page = event
    this.getChannelList()
  }
  onReset() {
    sessionStorage.removeItem('supportSessionData')
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getChannelList()
  }
}
