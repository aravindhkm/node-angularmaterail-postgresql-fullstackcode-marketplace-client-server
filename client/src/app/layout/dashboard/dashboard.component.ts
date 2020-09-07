import { DashboardService } from './dashboard.service';
import { Component, OnInit } from '@angular/core';
import { ChartType, ChartDataSets, ChartOptions, } from 'chart.js';
import { MultiDataSet, Label, Color } from 'ng2-charts';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  // createDocumentForm: FormGroup
  dropdownSettings: any = {}
  DashboardLists: any = [];
 
  // PIE CHART
  userChartLabels: Label[] = [];
  userChartData: MultiDataSet = [];
  userChartType: ChartType = 'doughnut';
  ChartColors: Color[] = [{ backgroundColor: ["#9E120E", "#FF5800", "#FFB414","#ffff00","#00ffcc"] }];
  // ChColors: Color[] = [{ backgroundColor: [,"#00ffcc","#4d4dff", "#FF5800"] }]
  // array = ["#ff4d4d", "#ffff00", "#1aff1a"]
  // ChColors: Color[] = [{ backgroundColor: [this.array,"#00ffcc","#4d4dff", "#FF5800"] }]

  data =[];
//  BAR CHART
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Offer Data' },
    // { data: [], label: 'Series B' }
  ];
  // DOUGNUT CHART
  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';
  public ChartOptions: ChartOptions = {
    responsive: true,
  };
  constructor(public dashboardService:DashboardService) { }

  ngOnInit(): void {
    this.getlistofChartData();
   
   
    // this.barChartData[0].data = [this.data.offerData, this.data.stockProducts, this.data.userData]  getChartData
  }
  convertoChartInfo()
  {
    
    let offer = this.DashboardLists.offerData;
      let stockProduct = this.DashboardLists.stockProducts;
      let soldProduct = this.DashboardLists.soldProducts;
      let userData = this.DashboardLists.userData;
    
      soldProduct && soldProduct.forEach(item=>{
        let userName;
        userData && userData.map(function(val, index){
          if(val.id == item.toUserId){
            userName = val.userName;
          }
          })
        this.doughnutChartLabels.push(userName);
        this.doughnutChartData.push(item.productCount);
      })
      stockProduct && stockProduct.forEach(item=>{
        // let chart = [item.userId]
        let userName;
        userData && userData.map(function(val, index){
          if(val.id == item.userId){
            userName = val.userName;
          }
          })
        this.userChartLabels.push(userName);
        this.userChartData.push(item.productCount);
      })
      offer && offer.forEach(item=>{
        let userName;
        userData && userData.map(function(val, index){
          if(val.id == item.toUserId){
            userName = val.userName;
          }
          })
          userName =userName+'  :  '+item.status;
      this.barChartLabels.push(userName);
      this.barChartData[0].data.push(item.offerCount);
    })
  }
  getlistofChartData()
  {
    try { 
      this.dashboardService.getChartData().subscribe(resp => {
          if (resp && resp.status) {
             this.DashboardLists = resp.data;
             this.convertoChartInfo();
             
          
      }else{
          this.DashboardLists =[]
          // this.noOfPages = 0
      }
      });
   } catch (error) {
     console.log(error)
      // this.spinner.hide();
      // this.toastr.error(this.translate.instant("error"));
  }
  }


}
