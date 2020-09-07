import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpHeaders, HttpClient, HttpParams, HttpClientModule } from "@angular/common/http";
// import { HttpModule } from '@angular/http';
import { Observable } from "rxjs";
// import { DeviceDetectorService } from 'ngx-device-detector';
import { LoaderService } from "../../shared/services/loader.service"
import { throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';

let headers = new HttpHeaders();

@Injectable()
export class ApiService {
	deviceInfo;
	loginDatas: Array<any> = [];
	token;
	baseUrl;
	status = '';
	isConnected = true;
	constructor(private http: HttpClient,private loaderService: LoaderService,public toster:ToastrManager,public router:Router,private connectionService: ConnectionService) 
	{
		this.connectionService.monitor().subscribe(isConnected => {
			this.isConnected = isConnected;
			if (this.isConnected) {
			  this.status = "ONLINE";
			  this.toster.infoToastr('Connected')
			}
			else {
			  this.status = "OFFLINE";
			  this.toster.warningToastr('Connection Failed');
			}
		  })  
		headers = headers.set("Content-Type", "application/json");
		this.baseUrl = environment.api_url;
		this.setToken();
	}
	private formatErrors(error: any) {
		if(error.error.err && error.error.err.msg == 'Invalid Token')
		{
			 this.toster.errorToastr('Session Expired');
			 this.router.navigateByUrl('/login')
		}
		this.loaderService.showLoadingIcon(false);
		return throwError(error);
	
	}
	get(path: any, params: HttpParams = new HttpParams()): Observable<any> {
		
		if(this.isConnected)
		{
		this.loaderService.showLoadingIcon(true);
		this.setToken();
		return this.http.get(`${this.baseUrl}${path}`, { params, headers: headers }).pipe(
			map((res: Response) => {
				this.loaderService.showLoadingIcon(false);
				return res;
			}),
			catchError(this.formatErrors.bind(this))
		);
		}
		else {
			this.toster.warningToastr('Connection Failed');
             
			return ;
		}
	}
  
	put(path: string, body: any): Observable<any> {
		this.loaderService.showLoadingIcon(true);
		this.setToken();
		return this.http
			.put(`${this.baseUrl}${path}`, (body), { headers: headers })
			.pipe(
				map((res: Response) => {
					this.loaderService.showLoadingIcon(false);
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}
	putAd(path: string, body: any): Observable<any> {
		var token = localStorage.getItem("token");
		
		this.loaderService.showLoadingIcon(true);
		this.setToken();
		return this.http
		.put(`${this.baseUrl}${path}`, (body),{ headers: {"Authorization": token} })
		.pipe(
		map((res: Response) => {
		this.loaderService.showLoadingIcon(false);
		return res;
		}),
		catchError(this.formatErrors.bind(this))
		);
		}
	mulipartput(path: string, body: any): Observable<any> {
		var token = localStorage.getItem("token");
		this.loaderService.showLoadingIcon(true);
		this.setToken();
		return this.http
			.put(`${this.baseUrl}${path}`, body, { headers: {"Authorization": token} })
			.pipe(
				map((res: Response) => {
					this.loaderService.showLoadingIcon(false);
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}
	

	post(path: string, body: any): Observable<any> {
		this.loaderService.showLoadingIcon(true);
		return this.http
			.post(`${this.baseUrl}${path}`, body, { headers: headers })
			.pipe(
				map((res: Response) => {
					this.loaderService.showLoadingIcon(false);
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}
	mulipartPost(path: string, body: any): Observable<any> {
		var token = localStorage.getItem("token");
		this.loaderService.showLoadingIcon(true);
		return this.http
			.post(`${this.baseUrl}${path}`, body, { headers: {"Authorization": token} })
			.pipe(
				map((res: Response) => {
					this.loaderService.showLoadingIcon(false);
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}

	delete(path): Observable<any> {
		this.loaderService.showLoadingIcon(true);
		return this.http
			.delete(`${this.baseUrl}${path}`, {
				headers: headers
			})
			.pipe(
				map((res: Response) => {
					this.loaderService.showLoadingIcon(false);
					return res;
				}),
				catchError(this.formatErrors.bind(this))
			);
	}

	setToken() {
		this.token = localStorage.getItem("token");
		if (this.token) {
			headers = headers.set("Authorization", this.token);
		}
	}

	upload(path, params): Observable<any> {
		this.loaderService.showLoadingIcon(true);
		let headers = new HttpHeaders();
		return this.http.post(`${this.baseUrl}${path}`, params, { headers: headers }).pipe(
			map((res: any) => {
				this.loaderService.showLoadingIcon(false);
				return res;
			})
		);
	}

	downloadFile(url) {
		this.loaderService.showLoadingIcon(true);
		return this.http.get(url, { responseType: "blob" }).pipe(
			map((res: any) => {
				this.loaderService.showLoadingIcon(false);
				return res;
			})
		);
	}
}
