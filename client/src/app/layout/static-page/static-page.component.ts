import { Component, OnInit } from '@angular/core';
import {StaticPageService} from './static-page.service'
import {Router} from '@angular/router';
import { ModalDialogService } from 'src/app/shared/services';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.css']
})
export class StaticPageComponent implements OnInit {
  staticListDatas=[]
  itemsPerPage=10
  page=1
  collection
  constructor(private staticPageService:StaticPageService,private router:Router,private modalDialogService:ModalDialogService) { }

  ngOnInit() {
    if(this.router.url.includes('back=true') == true){
      let sessionData=JSON.parse(sessionStorage.getItem('newsLetterSession'))
      this.page=sessionData.page ? sessionData.page : 1
      this.getStaticList()
    }
    else{
      sessionStorage.removeItem('newsLetterSession')
      this.getStaticList()
    }
  }
  getStaticList(){
    let obj={
      type:'template',
      page:this.page,
      limit:this.itemsPerPage
    }
    this.staticPageService.getStaticPageList(obj).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
        this.staticListDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  createStaticPage(){
    let obj={
      'page':this.page
    }
    sessionStorage.setItem('newsLetterSession',JSON.stringify(obj))
    this.router.navigateByUrl('newsletter/add')
  }
  viewPath(id){
    let obj={
      'page':this.page
    }
    sessionStorage.setItem('newsLetterSession',JSON.stringify(obj))
    this.router.navigateByUrl('newsletter/edit/'+ id)
  }
  onChange(event){
    this.page=event
    this.getStaticList()
  }
  delete(id){
    this.modalDialogService.confirm("Please Confirm", "Are you sure to want Delete ?", "Ok", "Cancel").subscribe(result => {
      if (result) {
        this.staticPageService.deleteTemplate(id).subscribe(resp=>{

        })
      }
  })

}
}
