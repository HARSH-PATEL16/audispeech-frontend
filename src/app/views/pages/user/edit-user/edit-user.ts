import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api-service/api.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from '../../../../views/pages/loader/loader';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

@Component({

  selector: 'app-edit-user',

  standalone: true,

  templateUrl: './edit-user.html',

  styleUrls: ['./edit-user.scss'],

  imports: [

    CommonModule,

    ReactiveFormsModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    ButtonDirective,

    LoaderComponent

  ]

})

export class EditUserComponent implements OnInit {

  userForm!: FormGroup;

  showPassword = false;

  showConfirmPassword = false;

  editUserId!: any;

  loader = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef

  ) {

    this.userForm = this.fb.group(

      {

        username: [

          '',

          [

            Validators.required,

            Validators.minLength(3),

            Validators.maxLength(30)

          ]

        ],

        fullName: [

          '',

          [

            Validators.required,

            Validators.maxLength(100)

          ]

        ],

        email: [

          '',

          [

            Validators.required,

            Validators.email

          ]

        ],

        mobileNo: [

          '',

          [

            Validators.required,

            Validators.pattern('^[0-9]{10}$')

          ]

        ],

        password: [

          '',

          [

            Validators.minLength(8)

          ]

        ],

        confirmPassword: [

          ''

        ],

        address: [

          '',

          Validators.maxLength(500)

        ]

      },

      {

        validators: this.passwordMatchValidator()

      }

    );

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.editUserId = params['id'];
      console.log('this.editUserId: ', this.editUserId);
      this.loadUser();
    });

  }

  /*======================================================
  LOAD USER
  ======================================================*/

  loadUser() {
    this.loader = true;
    this.apiService.get(`/user/details?userId=${this.editUserId}`, true)
      .subscribe({

        next: (response: any) => {

          this.loader = false;

          let userData = response.data || [];

          console.log('userData: ', userData);


          this.userForm.patchValue({

            username: userData.username,

            fullName: userData.name,

            email: userData.email,

            mobileNo: userData.mobile_no,

            address: userData.address

          });

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loader = false;
          console.error(err);
        }

      });

  }

  /*======================================================
  PASSWORD VALIDATOR
  ======================================================*/

  passwordMatchValidator(): ValidatorFn {

    return (

      control: AbstractControl

    ): ValidationErrors | null => {

      const password =

        control.get('password')?.value;

      const confirmPassword =

        control.get('confirmPassword')?.value;

      if (

        !password &&

        !confirmPassword

      ) {

        return null;

      }

      if (

        password !== confirmPassword

      ) {

        return {

          passwordMismatch: true

        };

      }

      return null;

    };

  }

  /*======================================================
  UPDATE USER
  ======================================================*/

  updateUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.loader = true;
    const payload: any = {
      id: this?.editUserId,
      username: this.userForm.value.username.trim(),
      name: this.userForm.value.fullName.trim(),
      email: this.userForm.value.email.trim().toLowerCase(),
      mobileNo: this.userForm.value.mobileNo,
      address: this.userForm.value.address?.trim() || ''
    };

    // Update password only if entered
    if (this.userForm.value.password) {
      payload.password = this.userForm.value.password;
      payload.confirmPassword = this.userForm.value.confirmPassword;
    }

    this.apiService.put(`/user/edit/`, payload, true)
      .subscribe({
        next: (response: any) => {

          this.loader = false;

          if (response.success == 1) {
            this.toastr.success(response.message);

            setTimeout(() => {
              this.router.navigate(['/user']);
            }, 500);
          } else {
            this.toastr.error(response?.message);
          }

        },
        error: (err: any) => {
          this.loader = false;
          console.error(err);
          this.toastr.error(err?.error?.message || 'Something went wrong');
        }
      });

  }

  /*======================================================
  BACK
  ======================================================*/

  back(): void {

    this.router.navigate([

      '/user'

    ]);

  }

}