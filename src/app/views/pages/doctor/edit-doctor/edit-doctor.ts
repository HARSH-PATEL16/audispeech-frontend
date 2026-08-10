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

  isSubmitting = false;

  loader = false;


  /*=========================================================
    SIGNATURE
  =========================================================*/

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


  /*=========================================================
    CREATE FORM
  =========================================================*/

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


  /*=========================================================
    LOAD STATES
  =========================================================*/

  loadStates(): void {

    this.apiService

      .get('/state/lists', true)

      .subscribe({

        next: (response: any) => {

          this.states = response.data || [];

          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error(

            'State loading error',

            err

          );

        }

      });

  }


  /*=========================================================
    STATE CHANGE
  =========================================================*/

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


  /*=========================================================
    LOAD CITIES
  =========================================================*/

  loadCities(stateId: number): void {

    this.apiService

      .get(

        `/cities/byState?stateId=${stateId}`,

        true

      )

      .subscribe({

        next: (response: any) => {

          this.cities = response.data || [];

          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error(

            'City loading error',

            err

          );

        }

      });

  }


  /*=========================================================
    CITY CHANGE
    AUTO PINCODE
  =========================================================*/

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


  /*=========================================================
    LOAD DOCTOR DETAILS
  =========================================================*/

  loadDoctor(id: string): void {

    this.loader = true;


    this.apiService

      .get(

        `/doctor/details?doctorId=${id}`,

        true

      )

      .subscribe({

        next: (response: any) => {

          this.loader = false;


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

            const signatureUrl = doctor.signature

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


          this.cdr.detectChanges();

        },


        error: (err) => {

          this.loader = false;

          console.error(

            'Doctor details loading error',

            err

          );

        }

      });

  }


  /*=========================================================
    SIGNATURE FILE SELECT
  =========================================================*/

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

    };


    reader.readAsDataURL(file);

  }


  /*=========================================================
    REMOVE SIGNATURE
  =========================================================*/

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


  /*=========================================================
    UPDATE DOCTOR
  =========================================================*/

  updateDoctor(): void {

    if (this.doctorForm.invalid) {

      this.doctorForm.markAllAsTouched();

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

    this.isSubmitting = true;


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

      .subscribe({

        next: (response: any) => {

          this.loader = false;

          this.isSubmitting = false;


          if (response?.success === 1) {

            this.router.navigate([

              '/doctor/list'

            ]);

          }

          else {

            console.error(

              response?.message ||

              'Doctor update failed.'

            );

          }

        },


        error: (err) => {

          this.loader = false;

          this.isSubmitting = false;


          console.error(

            'Doctor update error',

            err

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