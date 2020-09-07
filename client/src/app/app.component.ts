import { LoaderService } from './shared/services/loader.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { Subscription } from "rxjs";
import { Spinkit } from 'ng-http-loader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  private subscription: Subscription
  public spinkit = Spinkit;
  constructor(
      private loaderService: LoaderService
  ) {
  }
  showLoadingIcon = false;
  show = false;

  ngOnInit() {
      this.subscription = this.loaderService.currentLoadingIconStatus.subscribe(
          value => {
            this.showLoadingIcon = value;
            // console.log('showLoadingIcon : ', this.showLoadingIcon);
          }
        );

        // if(localStorage.getItem("token")){
        //   this.show = true
        // }
  }

  // ngDoCheck(){
  //   if(localStorage.getItem("token")){
  //     this.show = true
  //   } else{
  //     this.show = false;
  //   }
  // }

  
}