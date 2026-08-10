import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { Router } from '@angular/router';
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

  selector: 'app-add-user',

  standalone: true,

  templateUrl: './add-user.html',

  styleUrls: ['./add-user.scss'],

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

export class AddUserComponent {

  userForm!: FormGroup;

  showPassword = false;

  showConfirmPassword = false;

  loader = false;

  constructor(

    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService

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

            Validators.required,

            Validators.minLength(8)

          ]

        ],

        confirmPassword: [

          '',

          Validators.required

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

  /*======================================================
  PASSWORD MATCH VALIDATOR
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

        password &&

        confirmPassword &&

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
  SAVE USER
  ======================================================*/

  saveUser(): void {
    
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loader = true;

    const payload = {
      username: this.userForm.value.username.trim(),
      name: this.userForm.value.fullName.trim(),
      email: this.userForm.value.email.trim().toLowerCase(),
      mobileNo: this.userForm.value.mobileNo,
      password: this.userForm.value.password,
      confirmPassword: this.userForm.value.confirmPassword,
      address: this.userForm.value.address?.trim() || ''
    };

    this.apiService.post('/user/add', payload, true)
      .subscribe({
        next: (response: any) => {

          this.loader = false;

          if (response.success == 1) {
            this.toastr.success(response?.message);

            // Reset form
            this.reset();

            this.router.navigate(['/user']);
          } else {
            this.toastr.error(response?.message);
          }

        },
        error: (err) => {

          this.loader = false;
          console.error(err);
          this.toastr.error(err?.error?.message || 'Something went wrong');
        }
      });

  }


  /*======================================================
  RESET FORM
  ======================================================*/

  reset(): void {

    this.userForm.reset();

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