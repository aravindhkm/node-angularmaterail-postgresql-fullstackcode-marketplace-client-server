import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import PerfectScrollbar from 'perfect-scrollbar';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isActive: boolean;
  collapsed: boolean;
  showMenu: string;
  pushRightClass: string;
  sidebarPreview = false;

@Output() collapsedEvent = new EventEmitter<boolean>();

  constructor(public router: Router) {
    this.router.events.subscribe(val => {
      if (
          val instanceof NavigationEnd &&
          window.innerWidth <= 992 ?
          this.sidebarPreview = false &&
          this.sidebarHandle() : ''
      ) {
          // this.sidebarHandle();
      }
  });
}

  ngOnInit(): void {
    this.isActive = false;
    this.collapsed = false;
    this.showMenu = '';
    this.pushRightClass = 'push-right';
  }
  sidebarHandle(){
    let value = this.sidebarPreview ? false : true;
    this.sidebarPreview = value
    this.collapsedEvent.emit(value)
    }
// sidebarHandle(){
//     this.sidebarPreview = this.sidebarPreview ? false : true;
// }

onLoggedout() {
    localStorage.removeItem('isLoggedin');
}

}
