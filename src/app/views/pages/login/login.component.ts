import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalService } from '../../../services/storage/local.service';
import { environment } from '../../../../environments/environments';
import { LoaderComponent } from '../../../../app/views/pages/loader/loader';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  hidePassword = true;

  loader = false;

  loginForm: FormGroup;

  localData: any;
  currentUserId: any;

  company = {
    name: 'ABC Hearing Clinic',
    logo: 'assets/images/logo.png',
    coverImage: 'assets/images/login-cover.jpg'
  };

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalService,
    private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      remember: [false]
    });

    this.localData = this.localStorageService.getJsonValue(environment.typeDouble);
    this.currentUserId = this.localData ? this.localData["id"] : undefined
  }

  ngOnInit() {
    if (this.localData?.message) {
      this.toastr.error(this.localData.message);
      localStorage.clear();
    }
  }

  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };


    this.authService.login(payload).subscribe({
      next: (response) => {

        if (response?.success == 1) {

          this.toastr.success(response?.message);

          let storageData = {
            "id": response?.user?.id,
            "name": response?.user?.name,
            "username": response?.user?.username,
            "email": response?.user?.email,
            "mobileNo": response?.user?.mobil_no,
            "address": response?.user?.address
          }

          this.localStorageService.setJsonValue(environment.typeDouble, storageData);

          // Save JWT Token if your API returns one
          localStorage.setItem('token', response.access_token);

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          localStorage.clear();
          this.toastr.error(response?.message);
        }
      },
      error: (error) => {
        console.error('Login Failed', error);
        this.toastr.error(error?.error?.message);
      }
    });

  }
}