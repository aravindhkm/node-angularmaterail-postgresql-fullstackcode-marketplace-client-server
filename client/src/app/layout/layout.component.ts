import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  collapedSideBar: boolean;
  constructor() { }

  ngOnInit(): void {
  }
  receiveCollapsed($event) {
    this.collapedSideBar = $event;
}

}
