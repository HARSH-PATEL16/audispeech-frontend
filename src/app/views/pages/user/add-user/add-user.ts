import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

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


  /*======================================================*
   * PASSWORD MATCH VALIDATOR
   *======================================================*/

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


  /*======================================================*
   * SAVE USER
   *======================================================*/

  saveUser(): void {


    /*------------------------------------------------------
      FORM VALIDATION
    ------------------------------------------------------*/

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      this.toastr.error(
        this.getFormValidationMessage(),
        'Validation Error'
      );

      this.scrollToFirstInvalidControl();

      this.cdr.detectChanges();

      return;

    }


    /*------------------------------------------------------
      START LOADER
    ------------------------------------------------------*/

    this.loader = true;


    this.cdr.detectChanges();


    /*------------------------------------------------------
      CREATE PAYLOAD
    ------------------------------------------------------*/

    const payload = {

      username:

        this.userForm.value.username.trim(),

      name:

        this.userForm.value.fullName.trim(),

      email:

        this.userForm.value.email

          .trim()

          .toLowerCase(),

      mobileNo:

        this.userForm.value.mobileNo,

      password:

        this.userForm.value.password,

      confirmPassword:

        this.userForm.value.confirmPassword,

      address:

        this.userForm.value.address?.trim() || ''

    };


    /*------------------------------------------------------
      API CALL
    ------------------------------------------------------*/

    this.apiService

      .post(

        '/user/add',

        payload,

        true

      )

      .subscribe({

        /*--------------------------------------------------
          SUCCESS
        --------------------------------------------------*/

        next: (response: any) => {

          if (response?.success == 1) {

            this.toastr.success(

              response?.message ||

              'User added successfully.'

            );


            /*---------------------------------------------
              RESET FORM
            ---------------------------------------------*/

            this.reset();


            /*
             * Navigate after a successful response.
             *
             * Loader is stopped before navigation.
             */

            this.stopLoader(() => {

              this.router.navigate([

                '/user'

              ]);

            });

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to add user.'

            );


            this.stopLoader();

          }

        },


        /*--------------------------------------------------
          ERROR
        --------------------------------------------------*/

        error: (err: any) => {

          console.error(

            'Add User Error:',

            err

          );


          /*-----------------------------------------------
            BACKEND ERROR MESSAGE
          -----------------------------------------------*/

          if (err?.error?.message) {

            if (

              typeof err.error.message === 'string'

            ) {

              this.toastr.error(

                err.error.message

              );

            }

            else {

              const firstKey =

                Object.keys(

                  err.error.message

                )[0];


              this.toastr.error(

                err.error.message?.[firstKey]?.message ||

                'Validation failed.'

              );

            }

          }

          else {

            this.toastr.error(

              'Something went wrong. Please try again.'

            );

          }


          /*
           * IMPORTANT:
           *
           * Do not change loader immediately during
           * the current Angular change-detection cycle.
           *
           * This prevents:
           *
           * NG0100 ExpressionChangedAfterItHasBeenCheckedError
           */

          this.stopLoader();

        }

      });

  }


  /*======================================================*
   * STOP LOADER
   *======================================================*/

  private stopLoader(

    callback?: () => void

  ): void {

    setTimeout(() => {

      this.loader = false;


      this.cdr.detectChanges();


      if (callback) {

        callback();

      }

    }, 0);

  }



  private getFormValidationMessage(): string {
    const controls = this.userForm.controls;

    const fieldNames: Record<string, string> = {
      username: 'Username',
      fullName: 'Full Name',
      email: 'Email',
      mobileNo: 'Mobile Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      address: 'Address'
    };

    for (const field of Object.keys(controls)) {
      const control = controls[field];
      const name = fieldNames[field] || field;

      if (control.hasError('required')) {
        return `${name} is required.`;
      }

      if (control.hasError('minlength')) {
        return `${name} must be at least ${control.errors?.['minlength'].requiredLength} characters.`;
      }

      if (control.hasError('maxlength')) {
        return `${name} cannot exceed ${control.errors?.['maxlength'].requiredLength} characters.`;
      }

      if (control.hasError('email')) {
        return `Please enter a valid ${name}.`;
      }

      if (control.hasError('pattern')) {
        return `${name} must be exactly 10 digits.`;
      }
    }

    if (this.userForm.hasError('passwordMismatch')) {
      return 'Password and Confirm Password do not match.';
    }

    return 'Please check the form.';
  }


  // ============================================================
  // SCROLL TO FIRST INVALID CONTROL
  // ============================================================

  private scrollToFirstInvalidControl(): void {

    setTimeout(() => {

      const firstInvalid = document.querySelector(
        'input.ng-invalid, ' +
        'select.ng-invalid, ' +
        'textarea.ng-invalid'
      ) as HTMLElement;

      if (!firstInvalid) {

        return;

      }

      firstInvalid.scrollIntoView({

        behavior: 'smooth',

        block: 'center'

      });

      firstInvalid.focus();

    });

  }




  /*======================================================*
   * RESET FORM
   *======================================================*/

  reset(): void {

    this.userForm.reset();

  }


  /*======================================================*
   * BACK
   *======================================================*/

  back(): void {

    this.router.navigate([

      '/user'

    ]);

  }

}