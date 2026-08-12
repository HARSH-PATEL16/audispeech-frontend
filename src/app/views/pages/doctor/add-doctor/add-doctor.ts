import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { ApiService } from '../../../../services/api-service/api.service';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

import { finalize } from 'rxjs/operators';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  RowComponent
} from '@coreui/angular';

interface Gender {

  id: number;

  name: string;

}

interface State {

  id: number;

  name: string;

}

interface City {

  id: number;

  state_id: number;

  name: string;

  pincode: string;

}

@Component({

  selector: 'app-add-doctor',

  standalone: true,


  templateUrl: './add-doctor.html',

  styleUrls: ['./add-doctor.scss'],

  imports: [

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    FormDirective,

    FormControlDirective,

    ButtonDirective,

    ReactiveFormsModule,

    LoaderComponent,

    CommonModule

  ]

})


export class AddDoctorComponent implements OnInit {


  doctorForm!: FormGroup;

  isSubmitting = false;


  genders: Gender[] = [

    {

      id: 0,

      name: 'Male'

    },

    {

      id: 1,

      name: 'Female'

    },

    {

      id: 2,

      name: 'Other'

    }

  ];


  states: State[] = [];

  cities: City[] = [];

  loader = false;


  signatureFile: File | null = null;

  signaturePreview: string | null = null;

  signatureError: string = '';


  readonly MAX_SIGNATURE_SIZE = 5 * 1024 * 1024;


  readonly ALLOWED_SIGNATURE_TYPES = [

    'image/jpeg',

    'image/png',

    'image/webp'

  ];


  readonly ALLOWED_SIGNATURE_EXTENSIONS = [

    'jpg',

    'jpeg',

    'png',

    'webp'

  ];


  constructor(

    private fb: FormBuilder,

    private router: Router,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef,

    private toastr: ToastrService

  ) {

    this.createForm();

  }


  ngOnInit(): void {

    this.loadStates();

  }


  /*=========================================================*
   * CREATE FORM
   *=========================================================*/

  createForm(): void {

    this.doctorForm = this.fb.group({

      name: [

        '',

        Validators.required

      ],


      mobile_no: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[6-9]\d{9}$/)

        ]

      ],


      email: [

        '',

        Validators.email

      ],


      gender: [

        0

      ],


      qualification: [

        ''

      ],


      specialization: [

        '',

        Validators.required

      ],


      hospital_name: [

        '',

        Validators.required

      ],


      country_id: [

        1

      ],


      state_id: [

        ''

      ],


      city_id: [

        ''

      ],


      pincode: [

        ''

      ],


      address: [

        ''

      ],


      remarks: [

        ''

      ],


      status: [

        true

      ]

    });

  }


  get f() {

    return this.doctorForm.controls;

  }


  /*=========================================================*
   * SIGNATURE FILE SELECTION
   *=========================================================*/

  onSignatureSelected(event: Event): void {

    this.signatureError = '';


    const input = event.target as HTMLInputElement;


    if (!input.files || input.files.length === 0) {

      this.removeSignature(input);

      return;

    }


    const file = input.files[0];


    /*-------------------------------------------------------
      FILE NAME / EXTENSION
    -------------------------------------------------------*/

    const fileName = file.name.toLowerCase();


    const extension = fileName

      .split('.')

      .pop() || '';


    /*-------------------------------------------------------
      VALIDATE EXTENSION
    -------------------------------------------------------*/

    if (

      !this.ALLOWED_SIGNATURE_EXTENSIONS

        .includes(extension)

    ) {

      this.signatureError =

        'Invalid file format. Please upload JPG, JPEG, PNG or WEBP image.';


      this.toastr.error(

        this.signatureError

      );


      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;


      this.cdr.detectChanges();

      return;

    }


    /*-------------------------------------------------------
      VALIDATE MIME TYPE
    -------------------------------------------------------*/

    if (

      !this.ALLOWED_SIGNATURE_TYPES

        .includes(file.type)

    ) {

      this.signatureError =

        'Invalid image type. Please upload a valid JPG, JPEG, PNG or WEBP image.';


      this.toastr.error(

        this.signatureError

      );


      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;


      this.cdr.detectChanges();

      return;

    }


    /*-------------------------------------------------------
      VALIDATE FILE SIZE
    -------------------------------------------------------*/

    if (

      file.size > this.MAX_SIGNATURE_SIZE

    ) {

      this.signatureError =

        'Signature image size must not exceed 5 MB.';


      this.toastr.error(

        this.signatureError

      );


      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;


      this.cdr.detectChanges();

      return;

    }


    /*-------------------------------------------------------
      VALIDATE EMPTY / CORRUPTED FILE
    -------------------------------------------------------*/

    if (file.size === 0) {

      this.signatureError =

        'The selected file is empty or invalid.';


      this.toastr.error(

        this.signatureError

      );


      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;


      this.cdr.detectChanges();

      return;

    }


    /*-------------------------------------------------------
      SAVE FILE
    -------------------------------------------------------*/

    this.signatureFile = file;


    /*-------------------------------------------------------
      CREATE PREVIEW
    -------------------------------------------------------*/

    const reader = new FileReader();


    reader.onload = () => {

      this.signaturePreview =

        reader.result as string;


      this.cdr.detectChanges();

    };


    reader.onerror = () => {

      this.signatureError =

        'Unable to read the selected signature image.';


      this.signatureFile = null;

      this.signaturePreview = null;

      input.value = '';


      this.toastr.error(

        this.signatureError

      );


      this.cdr.detectChanges();

    };


    reader.readAsDataURL(file);

  }


  /*=========================================================*
   * REMOVE SIGNATURE
   *=========================================================*/

  removeSignature(

    input?: HTMLInputElement

  ): void {

    this.signatureFile = null;

    this.signaturePreview = null;

    this.signatureError = '';


    if (input) {

      input.value = '';

    }


    this.cdr.detectChanges();

  }


  /*=========================================================*
   * LOAD STATES
   *=========================================================*/

  loadStates(): void {

    this.loader = true;

    this.cdr.detectChanges();


    this.apiService

      .get('/state/lists', true)

      .pipe(

        finalize(() => {

          this.loader = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response: any) => {

          if (response?.success === 1) {

            this.states = response.data || [];

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to load states.'

            );

          }


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'State Load Error : ',

            err

          );


          this.toastr.error(

            err?.error?.message ||

            'Unable to load states. Please try again.'

          );

        }

      });

  }


  /*=========================================================*
   * LOAD CITIES BY STATE
   *=========================================================*/

  loadCities(

    stateId: number,

    selectedCity: number | null = null

  ): void {

    if (!stateId) {

      this.cities = [];

      return;

    }


    this.loader = true;

    this.cdr.detectChanges();


    this.apiService

      .get(

        `/cities/byState?stateId=${stateId}`,

        true

      )

      .pipe(

        finalize(() => {

          this.loader = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response: any) => {

          if (response?.success === 1) {

            this.cities = response.data || [];


            if (selectedCity) {

              this.doctorForm.patchValue({

                city_id: selectedCity

              });


              this.onCityChange();

            }

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to load cities.'

            );

          }


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'City Load Error : ',

            err

          );


          this.toastr.error(

            err?.error?.message ||

            'Unable to load cities. Please try again.'

          );

        }

      });

  }


  /*=========================================================*
   * STATE CHANGED
   *=========================================================*/

  onStateChange(): void {

    const stateId = this.doctorForm.value.state_id;


    this.doctorForm.patchValue({

      city_id: '',

      pincode: ''

    });


    this.cities = [];


    if (stateId) {

      this.loadCities(stateId);

    }

  }


  /*=========================================================*
   * CITY CHANGED
   *=========================================================*/

  onCityChange(): void {

    const cityId = this.doctorForm.value.city_id;


    const city = this.cities.find(

      x => x.id == cityId

    );


    this.doctorForm.patchValue({

      pincode: city ? city.pincode : ''

    });

  }


  /*=========================================================*
   * RESET FORM
   *=========================================================*/

  resetForm(): void {

    this.doctorForm.reset({

      gender: 0,

      country_id: 1,

      status: true

    });


    this.cities = [];

    this.signatureFile = null;

    this.signaturePreview = null;

    this.signatureError = '';

  }


  /*=========================================================*
   * SAVE DOCTOR
   *=========================================================*/

  saveDoctor(): void {


    /*-------------------------------------------------------
      FORM VALIDATION
    -------------------------------------------------------*/

    if (this.doctorForm.invalid) {

      this.doctorForm.markAllAsTouched();

      this.toastr.error(
        this.getFirstValidationMessage(),
        'Validation Error'
      );

      this.scrollToFirstInvalidControl();

      this.cdr.detectChanges();

      return;

    }



    /*-------------------------------------------------------
      FINAL SIGNATURE VALIDATION
    -------------------------------------------------------*/

    if (this.signatureFile) {


      if (

        !this.ALLOWED_SIGNATURE_TYPES.includes(

          this.signatureFile.type

        )

      ) {

        this.signatureError =

          'Invalid signature image format.';


        this.toastr.error(

          this.signatureError

        );


        this.cdr.detectChanges();

        return;

      }


      if (

        this.signatureFile.size >

        this.MAX_SIGNATURE_SIZE

      ) {

        this.signatureError =

          'Signature image size must not exceed 5 MB.';


        this.toastr.error(

          this.signatureError

        );


        this.cdr.detectChanges();

        return;

      }

    }


    this.loader = true;

    this.isSubmitting = true;

    this.cdr.detectChanges();


    /*-------------------------------------------------------
      CREATE FORM DATA
    -------------------------------------------------------*/

    const formData = new FormData();


    /*-------------------------------------------------------
      ADD FORM FIELDS
    -------------------------------------------------------*/

    Object.keys(this.doctorForm.value).forEach(key => {

      const value = this.doctorForm.value[key];


      if (

        value !== null &&

        value !== undefined

      ) {

        formData.append(

          key,

          value.toString()

        );

      }

    });


    /*-------------------------------------------------------
      ADD SIGNATURE
    -------------------------------------------------------*/

    if (this.signatureFile) {

      formData.append(

        'signature',

        this.signatureFile,

        this.signatureFile.name

      );

    }


    /*-------------------------------------------------------
      API CALL
    -------------------------------------------------------*/

    this.apiService

      .post(

        '/doctor/add',

        formData,

        true

      )

      .pipe(

        finalize(() => {

          this.loader = false;

          this.isSubmitting = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response: any) => {


          if (response?.success === 1) {

            this.toastr.success(

              response.message ||

              'Doctor added successfully.'

            );


            this.router.navigate([

              '/doctor/list'

            ]);

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to save doctor.'

            );

          }


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'Doctor Save Error:',

            err

          );


          /*-------------------------------------------------
            BACKEND ERROR MESSAGE
          -------------------------------------------------*/

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


          this.cdr.detectChanges();

        }

      });

  }



  private getFirstValidationMessage(): string {

    const fieldNames: Record<string, string> = {

      name: 'Doctor Name',

      mobile_no: 'Mobile Number',

      email: 'Email',

      gender: 'Gender',

      qualification: 'Qualification',

      specialization: 'Specialization',

      hospital_name: 'Hospital Name',

      country_id: 'Country',

      state_id: 'State',

      city_id: 'City',

      pincode: 'Pincode',

      address: 'Address',

      remarks: 'Remarks',

      status: 'Status'

    };


    for (const field of Object.keys(this.doctorForm.controls)) {

      const control = this.doctorForm.get(field);

      const name = fieldNames[field] || field;


      if (control?.hasError('required')) {

        return `${name} is required.`;

      }


      if (control?.hasError('pattern')) {

        if (field === 'mobile_no') {

          return 'Please enter a valid 10-digit mobile number.';

        }

        return `Please enter a valid ${name}.`;

      }


      if (control?.hasError('email')) {

        return 'Please enter a valid email address.';

      }

    }


    return 'Please check the form and correct the invalid fields.';

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




  /*=========================================================*
   * CANCEL
   *=========================================================*/

  cancel(): void {

    this.router.navigate([

      '/doctor/list'

    ]);

  }

}