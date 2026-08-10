import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'x-access-token': localStorage.getItem('access_token') || ''
      })
    };
  }

  get(path: string, tokenRequired = false) {
    const options = tokenRequired ? this.getHeaders() : {};
    return this.http.get(this.apiURL + path, options);
  }

  post(path: string, data: any, tokenRequired = false) {
    const options = tokenRequired ? this.getHeaders() : {};
    return this.http.post(this.apiURL + path, data, options);
  }

  put(path: string, data: any, tokenRequired = false) {
    const options = tokenRequired ? this.getHeaders() : {};
    return this.http.put(this.apiURL + path, data, options);
  }

  delete(path: string, tokenRequired = false) {
    const options = tokenRequired ? this.getHeaders() : {};
    return this.http.delete(this.apiURL + path, options);
  }
}