import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { finalize } from 'rxjs/operators';

import { ApiService } from '../../../../services/api-service/api.service';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

import { CommonModule } from '@angular/common';

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

  stateId: number;

  name: string;

  pincode: string;

}


@Component({

  selector: 'app-edit-doctor',

  standalone: true,

  templateUrl: './edit-doctor.html',

  styleUrls: ['./edit-doctor.scss'],

  imports: [

    CommonModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    FormDirective,

    FormControlDirective,

    ButtonDirective,

    ReactiveFormsModule,

    LoaderComponent

  ]

})


export class EditDoctorComponent implements OnInit {


  doctorId!: string;

  doctorForm!: FormGroup;

  loader = false;


  /*=========================================================*
   * SIGNATURE
   *=========================================================*/

  signatureFile: File | null = null;

  signaturePreview: string | null = null;

  signatureError = '';

  existingSignature: string | null = null;

  removeExistingSignature = false;

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


  constructor(

    private fb: FormBuilder,

    private router: Router,

    private route: ActivatedRoute,

    private apiService: ApiService,

    private toastr: ToastrService,

    private cdr: ChangeDetectorRef

  ) {

    this.createForm();

  }


  ngOnInit(): void {

    this.doctorId = String(

      this.route.snapshot.paramMap.get('id')

    );


    this.loadStates();


    if (this.doctorId) {

      this.loadDoctor(this.doctorId);

    }

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


      gender: [0],


      qualification: [''],


      hospital_name: [

        '',

        Validators.required

      ],


      specialization: [

        '',

        Validators.required

      ],


      remarks: [''],


      country_id: [1],


      state_id: [''],


      city_id: [''],


      pincode: [''],


      address: [''],


      status: [true]

    });

  }


  get f() {

    return this.doctorForm.controls;

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

          this.states = response.data || [];

          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'State loading error',

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
   * STATE CHANGE
   *=========================================================*/

  onStateChange(): void {

    const stateId = this.doctorForm.value.state_id;


    this.doctorForm.patchValue({

      city_id: '',

      pincode: ''

    });


    if (stateId) {

      this.loadCities(stateId);

    }

    else {

      this.cities = [];

    }

  }


  /*=========================================================*
   * LOAD CITIES
   *=========================================================*/

  loadCities(stateId: number): void {

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

          this.cities = response.data || [];

          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'City loading error',

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
   * CITY CHANGE
   * AUTO PINCODE
   *=========================================================*/

  onCityChange(): void {

    const cityId = this.doctorForm.value.city_id;


    const city = this.cities.find(

      x => x.id == cityId

    );


    if (city) {

      this.doctorForm.patchValue({

        pincode: city.pincode

      });

    }

  }


  /*=========================================================*
   * LOAD DOCTOR DETAILS
   *=========================================================*/

  loadDoctor(id: string): void {

    this.loader = true;

    this.cdr.detectChanges();


    this.apiService

      .get(

        `/doctor/details?doctorId=${id}`,

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

            const doctor = response.data;


            this.doctorForm.patchValue({

              name: doctor.name,

              mobile_no: doctor.mobile_no,

              email: doctor.email,

              gender: doctor.gender,

              qualification: doctor.qualification,

              hospital_name: doctor.hospital_name,

              specialization: doctor.specialization,

              remarks: doctor.remarks,

              country_id: doctor.country_id,

              state_id: doctor.state_id,

              city_id: doctor.city_id,

              pincode: doctor.pincode,

              address: doctor.address,

              status: doctor.status

            });


            /*---------------------------------------------
              LOAD EXISTING SIGNATURE
            ---------------------------------------------*/

            const signatureUrl = doctor.signature;


            if (signatureUrl) {

              this.existingSignature = signatureUrl;

              this.signaturePreview = signatureUrl;

            }


            if (doctor.state_id) {

              this.loadCities(

                doctor.state_id

              );

            }

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to load doctor details.'

            );

          }


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(

            'Doctor details loading error',

            err

          );


          this.toastr.error(

            err?.error?.message ||

            'Unable to load doctor details. Please try again.'

          );

        }

      });

  }


  /*=========================================================*
   * SIGNATURE FILE SELECT
   *=========================================================*/

  onSignatureSelected(event: Event): void {

    this.signatureError = '';


    const input = event.target as HTMLInputElement;


    if (!input.files || input.files.length === 0) {

      return;

    }


    const file = input.files[0];


    /*---------------------------------------------
      FILE EXTENSION
    ---------------------------------------------*/

    const fileName = file.name.toLowerCase();


    const extension =

      fileName.split('.').pop() || '';


    if (

      !this.ALLOWED_SIGNATURE_EXTENSIONS

        .includes(extension)

    ) {

      this.signatureError =

        'Invalid file format. Please upload JPG, JPEG, PNG or WEBP image.';


      input.value = '';

      this.signatureFile = null;


      return;

    }


    /*---------------------------------------------
      MIME TYPE
    ---------------------------------------------*/

    if (

      !this.ALLOWED_SIGNATURE_TYPES

        .includes(file.type)

    ) {

      this.signatureError =

        'Invalid image type. Please upload a valid JPG, JPEG, PNG or WEBP image.';


      input.value = '';

      this.signatureFile = null;


      return;

    }


    /*---------------------------------------------
      FILE SIZE
    ---------------------------------------------*/

    if (

      file.size > this.MAX_SIGNATURE_SIZE

    ) {

      this.signatureError =

        'Signature image size must not exceed 5 MB.';


      input.value = '';

      this.signatureFile = null;


      return;

    }


    /*---------------------------------------------
      EMPTY FILE
    ---------------------------------------------*/

    if (file.size === 0) {

      this.signatureError =

        'The selected file is empty or invalid.';


      input.value = '';

      this.signatureFile = null;


      return;

    }


    /*---------------------------------------------
      SAVE NEW FILE
    ---------------------------------------------*/

    this.signatureFile = file;

    this.removeExistingSignature = false;


    /*---------------------------------------------
      PREVIEW
    ---------------------------------------------*/

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

      this.signaturePreview =

        this.existingSignature;


      input.value = '';


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


    /*---------------------------------------------
      IF NEW FILE WAS SELECTED
    ---------------------------------------------*/

    if (this.signatureFile) {

      this.signatureFile = null;

      this.signatureError = '';


      if (input) {

        input.value = '';

      }


      /*-------------------------------------------
        RESTORE EXISTING SIGNATURE
      -------------------------------------------*/

      if (

        this.existingSignature &&

        !this.removeExistingSignature

      ) {

        this.signaturePreview =

          this.existingSignature;

      }

      else {

        this.signaturePreview = null;

      }


      this.cdr.detectChanges();

      return;

    }


    /*---------------------------------------------
      REMOVE EXISTING SIGNATURE
    ---------------------------------------------*/

    this.removeExistingSignature = true;

    this.signaturePreview = null;

    this.signatureError = '';


    if (input) {

      input.value = '';

    }


    this.cdr.detectChanges();

  }


  /*=========================================================*
   * UPDATE DOCTOR
   *=========================================================*/

  updateDoctor(): void {

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


    /*---------------------------------------------
      FINAL SIGNATURE VALIDATION
    ---------------------------------------------*/

    if (this.signatureFile) {

      if (

        !this.ALLOWED_SIGNATURE_TYPES

          .includes(this.signatureFile.type)

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

    this.cdr.detectChanges();


    /*=================================================
      CREATE FORM DATA
    =================================================*/

    const formData = new FormData();


    /*=================================================
      ADD FORM FIELDS
    =================================================*/

    formData.append(

      'id',

      this.doctorId

    );


    const formValue = this.doctorForm.value;


    Object.keys(formValue).forEach(key => {

      const value = formValue[key];


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


    /*=================================================
      SIGNATURE ACTION
    =================================================*/

    if (this.signatureFile) {

      /*---------------------------------------------
        NEW SIGNATURE
      ---------------------------------------------*/

      formData.append(

        'signature',

        this.signatureFile,

        this.signatureFile.name

      );

    }

    else if (this.removeExistingSignature) {

      /*---------------------------------------------
        REMOVE EXISTING SIGNATURE
      ---------------------------------------------*/

      formData.append(

        'remove_signature',

        'true'

      );

    }


    /*=================================================
      API CALL
    =================================================*/

    this.apiService

      .put(

        '/doctor/edit',

        formData,

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

            this.toastr.success(

              response?.message ||

              'Doctor updated successfully.'

            );


            this.router.navigate([

              '/doctor/list'

            ]);

          }

          else {

            this.toastr.error(

              response?.message ||

              'Doctor update failed.'

            );

          }

        },


        error: (err: any) => {

          console.error(

            'Doctor update error',

            err

          );


          /*=================================================
            BACKEND VALIDATION ERROR
          =================================================*/

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