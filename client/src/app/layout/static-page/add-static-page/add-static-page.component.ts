import { Component, OnInit } from '@angular/core';
import { FormGroup,Validators, FormBuilder } from '@angular/forms';
import { CONSTANTS } from './../../../constant/Constant';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { StaticPageService} from '../static-page.service'
import { ToastrManager } from 'ng6-toastr-notifications';
import { ActivatedRoute,Params, Router } from '@angular/router';


@Component({
  selector: 'app-add-static-page',
  templateUrl: './add-static-page.component.html',
  styleUrls: ['./add-static-page.component.css']
})
export class AddStaticPageComponent implements OnInit {
  staticPageForm:FormGroup
  constants=CONSTANTS
  submitted=false;
  patternCheck = false;
  default = " 'EX' _ Please Use this OTP to Reset : {{otp}}";
  templateId
  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: '100px',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    // uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'bottom',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
};
  constructor(private fb:FormBuilder,private staticPageService:StaticPageService,
    private toastr: ToastrManager,private activtedRoutes:ActivatedRoute,private router:Router) { }

  ngOnInit() {
    this.staticPageForm = this.fb.group({
      name: ['', [Validators.required]],
      content: [this.default, [Validators.required]],
      type: ['', [Validators.required]]
    });
    this.patternCheck = false;
    this.activtedRoutes.params.subscribe((params:Params)=>{
      this.templateId=params.id
    })
    if(this.templateId){
      this.getSpecificTemplate()
    }
  }
  getSpecificTemplate(){
    this.staticPageService.getSpecificTemplate(this.templateId).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
        let values=resp.data.rows[0]
        this.staticPageForm = this.fb.group({
          name: [values.name, [Validators.required]],
          content: [values.templateValue, [Validators.required]],
          type: [values.type, [Validators.required]]
        });
      }
    })
  }
  get f(){
    return this.staticPageForm.controls
  }
  onSubmit(){
    this.submitted=true;
    this.patternCheck = false;
    let formValues=this.staticPageForm.value
    let name =formValues.name;
    let checks ='{{'
    let check = '}}';
    var value = formValues.content.trim();
    if( value.includes(checks) && value.includes(check))
     {
        this.patternCheck = true;
     }
    let obj={
      'name':formValues.name,
      'templateValue':formValues.content,
      'type':formValues.type,
      'templateId':this.templateId
    }
    if(formValues.name && formValues.type && formValues.content && this.patternCheck){

    this.staticPageService.createTemplate(obj).subscribe(resp=>{
      if(resp && resp.status == true){
        this.toastr.successToastr(resp && resp.message)
        this.router.navigateByUrl('/newsletter?back=true')
      }
    })
  }
  else{
    this.toastr.errorToastr("Mandatory fields are required")
  }
  }
  listPath(){
    this.router.navigateByUrl('/newsletter?back=true')
  }
}