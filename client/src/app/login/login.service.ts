import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../shared/services';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class LoginService {

	API_ENDPOINT;
	constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {
		this.API_ENDPOINT = environment.api_url;
	}

	private formatErrors(error: any) {
		// this.loaderService.loaderDisable();
		return throwError(error);
	}

	login(body: any): Observable<any> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let Param;
		let path;
		path = '/auth/login';
		// path = '/admin/adminLogin';
		Param = environment.api_url;
	return this.apiService.post(`${path}`, JSON.stringify(body)).pipe(
				map((res: Response) => {
					// localStorage.setItem('userData', btoa(JSON.stringify(res)));
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}

	forgetPassword(params) {
		// let api = '/api/auth/forget';
		// return this.apiService.post(api,params);
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let Param;
		let path;
		path = '/auth/forgotPassword';
		Param = environment.api_url;
		return this.http
			.post(`${Param}${path}`, JSON.stringify(params), { headers: headers })
			.pipe(
				map((res: Response) => {
					localStorage.setItem('userData', btoa(JSON.stringify(res)));
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}
	otpVerification(Params){
		return this.apiService.post('/auth/verifyOtp',Params)
	}
	resetPassword(Params){
		return this.apiService.post('/auth/resetPassword',Params)
	}
}


