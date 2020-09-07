import { CONSTANTS } from './../constant/Constant';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user;
  email;
  password;
  authForm: FormGroup;
  submitted = false;
  constants = CONSTANTS;
  login=true
  otp=false
  confirmPassword=false
	constructor(private fb: FormBuilder,public toastr : ToastrManager,
		public router: Router,
		private loginService: LoginService,) { }


	ngOnInit() {
	const body = document.getElementsByTagName('body')[0];
	body.classList.add('body-login');
	this.authForm = this.fb.group({
		email: ['', [Validators.required]],
		password: ['', [Validators.required]],
		otp: ['',[Validators.required]],
		confirmPassword: ['',[Validators.required]],
		newPassword:['',[Validators.required]],
		rememberMe:[false,[Validators.required]]
	});
	if(sessionStorage.rememberMeDatas){
		let rememberMeDatas:any
		rememberMeDatas=JSON.parse(sessionStorage.getItem('rememberMeDatas'))
		this.authForm.controls['email'].setValue(rememberMeDatas.email)	
		this.authForm.controls['rememberMe'].setValue(rememberMeDatas.rememberMe)
		this.authForm.controls['password'].setValue(rememberMeDatas.password)
	}
	}
	get check() { return this.authForm; }

	onMessage(event) {
		this.receiveMessage(event);
	}

	receiveMessage(evnt) {
	}
	forgotPassword(){
		this.login=false
		this.submitted=false
		this.authForm.controls['email'].setValue('')
	}
	backPath(){
		this.login=true
		this.otp=false
		this.submitted=false
		this.confirmPassword=false
		this.authForm.controls['email'].setValue('')
		this.authForm.controls['password'].setValue('')
		this.authForm.controls['rememberMe'].setValue(false)
	}
	onLoggedin() {
		let value=this.authForm.value
		this.submitted=true
		if (!this.login && !this.otp && !this.confirmPassword) {
			if (value.email &&  this.authForm.controls.email.valid) {
				let params = {
					email: value.email
				}
				this.loginService.forgetPassword(params).subscribe(resp => {
					if(resp && resp.status){
						this.otp=true
						this.submitted=false
						this.authForm.controls['otp'].setValue('')
						this.toastr.successToastr(resp.message)
					}
					else{
						this.toastr.errorToastr(resp.message)
					}
				}, err => {
					 this.toastr.errorToastr(err.error && err.error.message)
				})
			}
			else {
				!value.email ? this.toastr.errorToastr("Please enter your email") : ''
			}
		}
		else if(this.otp && !this.login && !this.confirmPassword){
			if (value.otp) {
			let params = {
				email: value.email,
				otp:value.otp,
				type:'forgotPassword'
			}
			this.loginService.otpVerification(params).subscribe(resp => {
				if(resp && resp.status){
					this.otp=false
					this.submitted=false
					this.confirmPassword=true
					this.authForm.controls['newPassword'].setValue('')
					this.authForm.controls['confirmPassword'].setValue('')
					this.toastr.successToastr(resp.message)
				}
			}, err => {
				 this.toastr.errorToastr(err.error && err.error.message)
			})
		}
		else {
			this.toastr.errorToastr("Otp is required")
		}
		}
		else if(this.confirmPassword && !this.login && !this.otp){
			if ((value.confirmPassword == value.newPassword) && value.confirmPassword && value.newPassword) {
				let params = {
					email: value.email,
					password:value.confirmPassword
				}
				this.loginService.resetPassword(params).subscribe(resp => {
					if(resp && resp.status){
						this.confirmPassword=false
						this.login=true
						this.submitted=false
						this.authForm.controls['email'].setValue('')
						this.toastr.successToastr(resp.message)
					}
				}, err => {
					 this.toastr.errorToastr(err.error && err.error.message)
				})
			}
			else {
				!value.newPassword  || !value.confirmPassword ? this.toastr.errorToastr("Fields are required") : ''
			}
		}
		else {
			this.submitted = true;
			const credentials = this.authForm.value;
			if (credentials.email && credentials.password && this.authForm.controls.email.valid) {
				let params = {
					"email": credentials.email,
					"password": credentials.password,
					"type":"web"
				}
				this.loginService.login(params).subscribe(resp => {
					if (resp && resp.status) {
						localStorage.setItem('UserId', resp.data.id);
						localStorage.setItem('token', resp.data.sessionData.token);
						localStorage.setItem('isLoggedin', 'true');
						if(credentials.rememberMe){
							let obj={
								'rememberMe':credentials.rememberMe,
								'email':credentials.email,
								'password':credentials.password
							}
							sessionStorage.setItem('rememberMeDatas',JSON.stringify(obj))
						}
						else{
							sessionStorage.removeItem('rememberMeDatas')
						}
						this.toastr.successToastr(resp.message);
						this.router.navigateByUrl('/dashboard');
					}
				}, err => {
			        this.toastr.errorToastr(err.error && err.error.message)
				})
			}
			else {
				this.toastr.errorToastr('Mandatory fields are missing')
			}
		}
	}
}