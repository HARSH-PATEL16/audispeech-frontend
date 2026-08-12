import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ApiService } from '../../../../services/api-service/api.service';

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

    this.route.params.subscribe({

      next: (params) => {

        this.editUserId = params['id'];

        console.log(

          'this.editUserId: ',

          this.editUserId

        );

        this.loadUser();

      },

      error: (err) => {

        console.error(

          'Route Parameter Error:',

          err

        );

        this.toastr.error(

          'Unable to load user details.'

        );

        this.loader = false;

      }

    });

  }


  /*======================================================*
   *LOAD USER*
  ======================================================*/

  loadUser(): void {

    if (!this.editUserId) {

      this.toastr.error(

        'Invalid user ID.'

      );

      this.loader = false;

      return;

    }


    this.loader = true;


    this.apiService

      .get(

        `/user/details?userId=${this.editUserId}`,

        true

      )

      .subscribe({

        next: (response: any) => {

          if (response?.success === 1) {

            const userData = response.data || [];


            console.log(

              'userData: ',

              userData

            );


            this.userForm.patchValue({

              username: userData.username,

              fullName: userData.name,

              email: userData.email,

              mobileNo: userData.mobile_no,

              address: userData.address

            });

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to load user details.'

            );

          }


          this.loader = false;

          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'Load User Error:',

            err

          );


          this.loader = false;


          this.toastr.error(

            this.getErrorMessage(

              err,

              'Unable to load user details.'

            )

          );


          this.cdr.detectChanges();

        }

      });

  }


  /*======================================================*
   *PASSWORD VALIDATOR*
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


  /*======================================================*
   *UPDATE USER*
  ======================================================*/

  updateUser(): void {


    /*======================================================
      FORM VALIDATION
    ======================================================*/

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


    /*======================================================
      PREVENT DUPLICATE SUBMISSION
    ======================================================*/

    if (this.loader) {

      return;

    }


    /*======================================================
      START LOADER
    ======================================================*/

    this.loader = true;


    /*======================================================
      FORM VALUES
    ======================================================*/

    const payload: any = {

      id: this?.editUserId,

      username:

        this.userForm.value.username

          .trim(),

      name:

        this.userForm.value.fullName

          .trim(),

      email:

        this.userForm.value.email

          .trim()

          .toLowerCase(),

      mobileNo:

        this.userForm.value.mobileNo,

      address:

        this.userForm.value.address

          ?.trim() || ''

    };


    /*======================================================
      UPDATE PASSWORD ONLY IF ENTERED
    ======================================================*/

    if (

      this.userForm.value.password

    ) {

      payload.password =

        this.userForm.value.password;


      payload.confirmPassword =

        this.userForm.value.confirmPassword;

    }


    /*======================================================
      API CALL
    ======================================================*/

    this.apiService

      .put(

        `/user/edit/`,

        payload,

        true

      )

      .subscribe({

        next: (response: any) => {

          /*----------------------------------------------
            ALWAYS STOP LOADER
          ----------------------------------------------*/

          this.loader = false;


          /*----------------------------------------------
            SUCCESS
          ----------------------------------------------*/

          if (

            response?.success === 1

          ) {

            this.toastr.success(

              response?.message ||

              'User updated successfully.'

            );


            this.cdr.detectChanges();


            this.router.navigate([

              '/user'

            ]);

          }


          /*----------------------------------------------
            API RETURNED FAILURE
          ----------------------------------------------*/

          else {

            this.toastr.error(

              response?.message ||

              'Unable to update user.'

            );


            this.cdr.detectChanges();

          }

        },


        error: (err: any) => {

          /*----------------------------------------------
            ALWAYS STOP LOADER
          ----------------------------------------------*/

          this.loader = false;


          console.error(

            'Update User Error:',

            err

          );


          /*----------------------------------------------
            SHOW API ERROR
          ----------------------------------------------*/

          this.toastr.error(

            this.getErrorMessage(

              err,

              'Something went wrong. Please try again.'

            )

          );


          this.cdr.detectChanges();

        }

      });

  }


  /*======================================================*
   *GET ERROR MESSAGE*
  ======================================================*/

  private getErrorMessage(

    err: any,

    defaultMessage: string

  ): string {


    const message =

      err?.error?.message;


    /*----------------------------------------------
      STRING MESSAGE
    ----------------------------------------------*/

    if (

      typeof message === 'string' &&

      message.trim()

    ) {

      return message;

    }


    /*----------------------------------------------
      ARRAY MESSAGE
    ----------------------------------------------*/

    if (

      Array.isArray(message) &&

      message.length > 0

    ) {

      const firstMessage =

        message[0];


      if (

        typeof firstMessage ===

        'string'

      ) {

        return firstMessage;

      }


      if (

        firstMessage?.message

      ) {

        return firstMessage.message;

      }

    }


    /*----------------------------------------------
      OBJECT MESSAGE
    ----------------------------------------------*/

    if (

      message &&

      typeof message === 'object'

    ) {

      const firstKey =

        Object.keys(message)[0];


      if (firstKey) {

        const firstValue =

          message[firstKey];


        if (

          typeof firstValue ===

          'string'

        ) {

          return firstValue;

        }


        if (

          firstValue?.message

        ) {

          return firstValue.message;

        }

      }

    }


    /*----------------------------------------------
      HTTP STATUS SPECIFIC MESSAGE
    ----------------------------------------------*/

    if (err?.status === 409) {

      return (

        'This user already exists.'

      );

    }


    if (err?.status === 400) {

      return (

        'Invalid user information.'

      );

    }


    if (err?.status === 401) {

      return (

        'You are not authorized to perform this action.'

      );

    }


    if (err?.status === 404) {

      return (

        'User not found.'

      );

    }


    if (err?.status >= 500) {

      return (

        'Server error. Please try again later.'

      );

    }


    return defaultMessage;

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
   *BACK*
  ======================================================*/

  back(): void {

    this.router.navigate([

      '/user'

    ]);

  }

}
