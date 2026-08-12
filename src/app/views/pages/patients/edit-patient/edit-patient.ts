import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { finalize } from 'rxjs/operators';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ApiService } from '../../../../services/api-service/api.service';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

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


interface Doctor {
  id: number;
  name: string;
}


@Component({
  selector: 'app-edit-patient',
  standalone: true,

  templateUrl: './edit-patient.html',

  styleUrls: ['./edit-patient.scss'],

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


export class EditPatientComponent implements OnInit {


  patientId!: string;

  patientForm!: FormGroup;

  isSubmitting = false;

  loadingPatient = false;

  loadingStates = false;

  loadingCities = false;

  loadingDoctors = false;

  states: State[] = [];

  cities: City[] = [];

  doctors: Doctor[] = [];

  loader = false;


  genders = [

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


  bloodGroups = [

    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'

  ];


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

    this.patientId =

      this.route.snapshot.paramMap.get('id') || '';


    this.loadInitialData();

  }


  // ============================================================
  // CREATE FORM
  // ============================================================

  createForm(): void {

    this.patientForm = this.fb.group({

      // ===============================
      // Personal Information
      // ===============================

      patientName: [

        '',

        [

          Validators.required,

          Validators.minLength(2),

          Validators.maxLength(100)

        ]

      ],


      mobileNo: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[6-9]\d{9}$/)

        ]

      ],


      gender: [

        '',

        Validators.required

      ],


      dob: [

        ''

      ],


      bloodGroup: [

        ''

      ],


      email: [

        '',

        Validators.email

      ],


      state: [

        '',

        Validators.required

      ],


      city: [

        '',

        Validators.required

      ],


      pincode: [

        '',

        Validators.pattern(/^[1-9][0-9]{5}$/)

      ],


      address: [

        '',

        [

          Validators.required,

          Validators.maxLength(500)

        ]

      ],


      // ===============================
      // Visit Information
      // ===============================

      visitDate: [

        '',

        Validators.required

      ],


      referenceBy: [

        '',

        Validators.required

      ],


      purposeForVisit: [

        '',

        Validators.maxLength(1000)

      ],


      // ===============================
      // Clinical Information
      // ===============================

      chiefComplaints: [

        '',

        Validators.maxLength(2000)

      ],


      remarks: [

        '',

        Validators.maxLength(2000)

      ]

    });

  }


  get f() {

    return this.patientForm.controls;

  }


  // ============================================================
  // TODAY
  // ============================================================

  today(): string {

    const d = new Date();

    const month =

      ('0' + (d.getMonth() + 1)).slice(-2);

    const day =

      ('0' + d.getDate()).slice(-2);


    return (

      `${d.getFullYear()}-${month}-${day}`

    );

  }


  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  loadInitialData(): void {

    this.loadDoctors();

    this.loadStates();

  }


  // ============================================================
  // LOAD DOCTORS
  // ============================================================

  loadDoctors(): void {

    this.loader = true;


    this.apiService

      .get(

        '/doctor/lists',

        true

      )

      .subscribe({

        next: (response: any) => {

          this.loader = false;


          this.doctors =

            response?.data || [];


          this.loadPatient();


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(

            'Doctor Load Error:',

            error

          );


          this.loader = false;


          this.toastr.error(

            error?.error?.message ||

            'Unable to load doctors.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================================
  // LOAD STATES
  // ============================================================

  loadStates(): void {

    this.apiService

      .get(

        '/state/lists',

        true

      )

      .subscribe({

        next: (response: any) => {

          this.states =

            response?.data || [];


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(

            'State Load Error:',

            error

          );


          this.toastr.error(

            error?.error?.message ||

            'Unable to load states.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================================
  // LOAD PATIENT DETAILS
  // ============================================================

  loadPatient(): void {

    if (!this.patientId) {

      this.toastr.error(

        'Invalid patient ID.'

      );

      return;

    }


    this.loadingPatient = true;


    this.apiService

      .get(

        `/patient/details?patientId=${this.patientId}`,

        true

      )

      .subscribe({

        next: (response: any) => {

          const patient =

            response?.data;


          if (!patient) {

            this.loadingPatient = false;


            this.toastr.error(

              response?.message ||

              'Unable to load patient details.'

            );


            this.cdr.detectChanges();

            return;

          }


          this.loadCities(

            patient.state,

            patient

          );


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(

            'Patient Load Error:',

            error

          );


          this.loadingPatient = false;


          this.toastr.error(

            error?.error?.message ||

            'Unable to load patient details.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================================
  // STATE CHANGED
  // ============================================================

  onStateChange(): void {

    const stateId =

      this.f['state'].value;


    this.patientForm.patchValue({

      city: '',

      pincode: ''

    });


    this.cities = [];


    if (!stateId) {

      return;

    }


    this.loadCities(stateId);

  }


  // ============================================================
  // LOAD CITIES
  // ============================================================

  loadCities(

    stateId: number,

    patientData: any = null

  ): void {

    if (!stateId) {

      this.loadingCities = false;

      return;

    }


    this.loadingCities = true;


    this.apiService

      .get(

        `/cities/byState?stateId=${stateId}`,

        true

      )

      .subscribe({

        next: (response: any) => {

          this.cities =

            response?.data || [];


          this.loadingCities = false;


          // ====================================================
          // PATCH PATIENT DATA
          // ====================================================

          if (patientData) {

            const dob =

              patientData.dob

                ? patientData.dob.split('T')[0]

                : '';


            const visitDate =

              patientData.visitDate

                ? patientData.visitDate.split('T')[0]

                : '';


            this.patientForm.patchValue({

              patientName:

                patientData.patientName,


              mobileNo:

                patientData.mobileNo,


              gender:

                patientData.gender,


              dob:

                dob,


              bloodGroup:

                patientData.bloodGroup,


              email:

                patientData.email,


              state:

                patientData.state,


              city:

                patientData.city,


              pincode:

                patientData.pincode,


              address:

                patientData.address,


              visitDate:

                visitDate,


              referenceBy:

                patientData.referenceBy?.id,


              purposeForVisit:

                patientData.purposeForVisit,


              chiefComplaints:

                patientData.chiefComplaints,


              remarks:

                patientData.remarks

            });

          }


          this.loadingPatient = false;


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(

            'City Load Error:',

            error

          );


          this.loadingCities = false;


          this.loadingPatient = false;


          this.toastr.error(

            error?.error?.message ||

            'Unable to load cities.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================================
  // VALIDATE DATE OF BIRTH
  // ============================================================

  validateDob(): boolean {

    const dob =

      this.f['dob'].value;


    if (!dob) {

      return true;

    }


    const birthDate =

      new Date(dob);


    const today =

      new Date();


    birthDate.setHours(

      0,

      0,

      0,

      0

    );


    today.setHours(

      0,

      0,

      0,

      0

    );


    if (birthDate > today) {

      this.toastr.error(

        'Date of Birth cannot be greater than today.',

        'Validation Error'

      );


      this.patientForm.patchValue({

        dob: ''

      });


      return false;

    }


    return true;

  }


  // ============================================================
  // ALLOW NUMBERS ONLY
  // ============================================================

  onlyNumber(

    event: KeyboardEvent

  ): void {

    const allowed =

      /[0-9]/.test(event.key) ||

      [

        'Backspace',

        'Delete',

        'ArrowLeft',

        'ArrowRight',

        'Tab'

      ].includes(event.key);


    if (!allowed) {

      event.preventDefault();

    }

  }


  // ============================================================
  // MOBILE INPUT
  // ============================================================

  onMobileInput(event: any): void {

    let value =

      event.target.value || '';


    value = value.replace(

      /\D/g,

      ''

    );


    if (value.length > 10) {

      value = value.substring(

        0,

        10

      );

    }


    this.patientForm.patchValue({

      mobileNo: value

    });

  }


  // ============================================================
  // FIRST VALIDATION MESSAGE
  // ============================================================

  private getFirstValidationMessage(): string {

    const fieldNames: Record<string, string> = {

      patientName: 'Patient Name',

      mobileNo: 'Mobile Number',

      gender: 'Gender',

      dob: 'Date of Birth',

      bloodGroup: 'Blood Group',

      email: 'Email',

      state: 'State',

      city: 'City',

      pincode: 'Pincode',

      address: 'Address',

      visitDate: 'Visit Date',

      referenceBy: 'Reference By',

      purposeForVisit: 'Purpose for Visit',

      chiefComplaints: 'Chief Complaints',

      remarks: 'Remarks'

    };


    // ==========================================================
    // CHECK FORM CONTROLS IN ORDER
    // ==========================================================

    for (

      const field of Object.keys(

        this.patientForm.controls

      )

    ) {

      const control =

        this.patientForm.get(field);


      const name =

        fieldNames[field] || field;


      if (!control) {

        continue;

      }


      // ========================================================
      // REQUIRED
      // ========================================================

      if (

        control.hasError('required')

      ) {

        return `${name} is required.`;

      }


      // ========================================================
      // MIN LENGTH
      // ========================================================

      if (

        control.hasError('minlength')

      ) {

        return (

          `${name} must be at least ` +

          `${control.errors?.['minlength']?.requiredLength} ` +

          `characters.`

        );

      }


      // ========================================================
      // MAX LENGTH
      // ========================================================

      if (

        control.hasError('maxlength')

      ) {

        return (

          `${name} cannot exceed ` +

          `${control.errors?.['maxlength']?.requiredLength} ` +

          `characters.`

        );

      }


      // ========================================================
      // EMAIL
      // ========================================================

      if (

        control.hasError('email')

      ) {

        return (

          'Please enter a valid email address.'

        );

      }


      // ========================================================
      // PATTERN
      // ========================================================

      if (

        control.hasError('pattern')

      ) {

        if (

          field === 'mobileNo'

        ) {

          return (

            'Please enter a valid 10-digit mobile number.'

          );

        }


        if (

          field === 'pincode'

        ) {

          return (

            'Please enter a valid 6-digit pincode.'

          );

        }


        return (

          `Please enter a valid ${name}.`

        );

      }

    }


    return (

      'Please check the form and correct the invalid fields.'

    );

  }


  // ============================================================
  // UPDATE PATIENT
  // ============================================================

  updatePatient(): void {


    // ==========================================================
    // DATE OF BIRTH VALIDATION
    // ==========================================================

    if (!this.validateDob()) {

      return;

    }


    // ==========================================================
    // FORM VALIDATION
    // ==========================================================

    if (this.patientForm.invalid) {

      this.patientForm.markAllAsTouched();


      this.toastr.error(

        this.getFirstValidationMessage(),

        'Validation Error'

      );


      this.scrollToFirstInvalidControl();


      this.cdr.detectChanges();


      return;

    }


    // ==========================================================
    // PREVENT DUPLICATE SUBMISSION
    // ==========================================================

    if (this.loader) {

      return;

    }


    // ==========================================================
    // START LOADER
    // ==========================================================

    this.loader = true;


    // ==========================================================
    // PAYLOAD
    // ==========================================================

    const payload = {

      id:

        this.patientId,


      patientName:

        this.patientForm.value.patientName

          ?.trim(),


      mobileNo:

        this.patientForm.value.mobileNo,


      gender:

        this.patientForm.value.gender,


      dob:

        this.patientForm.value.dob,


      bloodGroup:

        this.patientForm.value.bloodGroup,


      email:

        this.patientForm.value.email

          ?.trim()

          ?.toLowerCase(),


      state:

        this.patientForm.value.state,


      city:

        this.patientForm.value.city,


      pincode:

        this.patientForm.value.pincode,


      address:

        this.patientForm.value.address

          ?.trim(),


      visitDate:

        this.patientForm.value.visitDate,


      referenceBy:

        this.patientForm.value.referenceBy,


      purposeForVisit:

        this.patientForm.value.purposeForVisit

          ?.trim(),


      chiefComplaints:

        this.patientForm.value.chiefComplaints

          ?.trim(),


      remarks:

        this.patientForm.value.remarks

          ?.trim()

    };


    // ==========================================================
    // API CALL
    // ==========================================================

    this.apiService

      .put(

        '/patient/edit',

        payload,

        true

      )

      .pipe(

        finalize(() => {

          this.loader = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        // ======================================================
        // SUCCESS / API RESPONSE
        // ======================================================

        next: (response: any) => {

          console.log(

            'Update Patient Response:',

            response

          );


          // ====================================================
          // API FAILURE WITH HTTP 200
          // ====================================================

          if (

            response?.success === 0

          ) {

            this.toastr.error(

              response?.message ||

              'Mobile number is already registered.'

            );


            return;

          }


          // ====================================================
          // API SUCCESS
          // ====================================================

          if (

            response?.success === 1

          ) {

            this.toastr.success(

              response?.message ||

              'Patient updated successfully.'

            );


            this.router.navigate([

              '/patient/list'

            ]);


            return;

          }


          // ====================================================
          // UNKNOWN RESPONSE
          // ====================================================

          this.toastr.error(

            response?.message ||

            'Something went wrong. Please try again.'

          );

        },


        // ======================================================
        // HTTP ERROR
        // ======================================================

        error: (error: any) => {

          console.error(

            'Update Patient Error:',

            error

          );


          // ====================================================
          // STRING ERROR MESSAGE
          // ====================================================

          if (

            typeof error?.error?.message ===

            'string'

          ) {

            this.toastr.error(

              error.error.message ||

              'Something went wrong.'

            );

          }


          // ====================================================
          // OBJECT ERROR MESSAGE
          // ====================================================

          else if (

            error?.error?.message &&

            typeof error.error.message ===

            'object'

          ) {

            const firstKey =

              Object.keys(

                error.error.message

              )[0];


            const message =

              error.error.message?.[firstKey];


            this.toastr.error(

              message?.message ||

              'Validation failed.'

            );

          }


          // ====================================================
          // UNKNOWN ERROR
          // ====================================================

          else {

            this.toastr.error(

              'Something went wrong. Please try again.'

            );

          }


          this.cdr.detectChanges();

        }

      });

  }


  // ============================================================
  // SCROLL TO FIRST INVALID CONTROL
  // ============================================================

  private scrollToFirstInvalidControl(): void {

    setTimeout(() => {

      const firstInvalid =

        document.querySelector(

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


  // ============================================================
  // RESET FORM
  // ============================================================

  resetForm(): void {

    this.patientForm.reset();

    this.cities = [];

  }


  // ============================================================
  // BACK
  // ============================================================

  back(): void {

    this.router.navigate([

      '/patient/list'

    ]);

  }

}