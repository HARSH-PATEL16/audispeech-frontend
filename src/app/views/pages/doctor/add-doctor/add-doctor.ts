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


  /*=========================================================
  SIGNATURE FILE SELECTION
=========================================================*/

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

    if (!this.ALLOWED_SIGNATURE_EXTENSIONS.includes(extension)) {

      this.signatureError =
        'Invalid file format. Please upload JPG, JPEG, PNG or WEBP image.';

      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;

      return;

    }


    /*-------------------------------------------------------
      VALIDATE MIME TYPE
    -------------------------------------------------------*/

    if (!this.ALLOWED_SIGNATURE_TYPES.includes(file.type)) {

      this.signatureError =
        'Invalid image type. Please upload a valid JPG, JPEG, PNG or WEBP image.';

      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;

      return;

    }


    /*-------------------------------------------------------
      VALIDATE FILE SIZE
    -------------------------------------------------------*/

    if (file.size > this.MAX_SIGNATURE_SIZE) {

      this.signatureError =
        'Signature image size must not exceed 5 MB.';

      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;

      return;

    }


    /*-------------------------------------------------------
      VALIDATE EMPTY / CORRUPTED FILE
    -------------------------------------------------------*/

    if (file.size === 0) {

      this.signatureError =
        'The selected file is empty or invalid.';

      input.value = '';

      this.signatureFile = null;

      this.signaturePreview = null;

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

      this.signaturePreview = reader.result as string;

      this.cdr.detectChanges();

    };

    reader.onerror = () => {

      this.signatureError =
        'Unable to read the selected signature image.';

      this.signatureFile = null;

      this.signaturePreview = null;

      input.value = '';

    };

    reader.readAsDataURL(file);

  }


  /*=========================================================
  REMOVE SIGNATURE
=========================================================*/

  removeSignature(input?: HTMLInputElement): void {

    this.signatureFile = null;

    this.signaturePreview = null;

    this.signatureError = '';

    if (input) {

      input.value = '';

    }

    this.cdr.detectChanges();

  }

  /*=========================================================
  LOAD STATES
=========================================================*/
  loadStates(): void {

    this.loader = true;

    this.apiService.get('/state/lists', true)
      .subscribe({

        next: (response: any) => {

          this.loader = false;

          if (response?.success === 1) {

            this.states = response.data || [];

            this.cdr.detectChanges();

          }

        },

        error: (err) => {

          this.loader = false;

          console.error('State Load Error : ', err);

        }

      });

  }

  /*=========================================================
    LOAD CITIES BY STATE
  =========================================================*/
  loadCities(stateId: number, selectedCity: number | null = null): void {

    if (!stateId) {

      this.cities = [];

      return;

    }

    this.apiService
      .get(`/cities/byState?stateId=${stateId}`, true)
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

            this.cdr.detectChanges();

          }

        },

        error: (err) => {

          console.error('City Load Error : ', err);

        }

      });

  }

  /*=========================================================
    STATE CHANGED
  =========================================================*/
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

  /*=========================================================
    CITY CHANGED
  =========================================================*/
  onCityChange(): void {

    const cityId = this.doctorForm.value.city_id;

    const city = this.cities.find(x => x.id == cityId);

    this.doctorForm.patchValue({

      pincode: city ? city.pincode : ''

    });

  }

  /*=========================================================
    RESET FORM
  =========================================================*/
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

  /*=========================================================
  SAVE DOCTOR
=========================================================*/
  /*=========================================================
  SAVE DOCTOR
=========================================================*/

  saveDoctor(): void {

    if (this.doctorForm.invalid) {

      this.doctorForm.markAllAsTouched();

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

        return;

      }


      if (
        this.signatureFile.size >
        this.MAX_SIGNATURE_SIZE
      ) {

        this.signatureError =
          'Signature image size must not exceed 5 MB.';

        return;

      }

    }


    this.loader = true;


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
      .post('/doctor/add', formData, true)
      .subscribe({

        next: (response: any) => {

          this.loader = false;


          if (response?.success === 1) {

            this.toastr.success(
              response.message ||
              'Doctor added successfully.'
            );


            this.router.navigate([
              '/doctor/list'
            ]);

          } else {

            this.toastr.error(
              response?.message ||
              'Unable to save doctor.'
            );

          }

        },


        error: (err: any) => {

          this.loader = false;

          console.error(
            'Doctor Save Error:',
            err
          );


          this.toastr.error(
            err?.error?.message ||
            'Something went wrong.'
          );

        }

      });

  }

  /*=========================================================
    CANCEL
  =========================================================*/
  cancel(): void {

    this.router.navigate([
      '/doctor/list'
    ]);

  }

}