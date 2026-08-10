import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

    this.patientId = this.route.snapshot.paramMap.get('id') || '';

    this.loadInitialData();

  }

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

      dob: [''],

      bloodGroup: [''],

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

  today(): string {

    const d = new Date();

    const month = ('0' + (d.getMonth() + 1)).slice(-2);

    const day = ('0' + d.getDate()).slice(-2);

    return `${d.getFullYear()}-${month}-${day}`;

  }

  // ============================================================
  // Load Initial Data
  // ============================================================

  loadInitialData(): void {

    this.loadDoctors();

    this.loadStates();

  }

  // ============================================================
  // Load Doctors
  // ============================================================

  loadDoctors(): void {

    this.loader = true;

    this.apiService.get('/doctor/lists', true).subscribe({

      next: (response: any) => {

        this.loader = false;

        this.doctors = response.data || [];

        this.loadPatient();

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(error);
        this.loader = false;

      }

    });

  }

  // ============================================================
  // Load States
  // ============================================================

  loadStates(): void {

    this.apiService.get('/state/lists', true).subscribe({

      next: (response: any) => {

        this.states = response.data || [];

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(error);

      }

    });

  }

  // ============================================================
  // Load Patient Details
  // ============================================================

  loadPatient(): void {

    if (!this.patientId) {

      return;

    }

    this.loadingPatient = true;

    this.apiService.get(

      `/patient/details?patientId=${this.patientId}`,

      true

    ).subscribe({

      next: (response: any) => {

        const patient = response.data;

        if (!patient) {

          this.loadingPatient = false;

          return;

        }

        this.loadCities(patient.state, patient);

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(error);

        this.loadingPatient = false;

      }

    });

  }

  // ============================================================
  // State Changed
  // ============================================================

  onStateChange(): void {

    const stateId = this.f['state'].value;

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
  // Load Cities
  // ============================================================

  loadCities(

    stateId: number,

    patientData: any = null

  ): void {

    this.loadingCities = true;

    this.apiService.get(

      `/cities/byState?stateId=${stateId}`,

      true

    ).subscribe({

      next: (response: any) => {

        this.cities = response.data || [];

        this.loadingCities = false;

        if (patientData) {
          console.log('patientData: ', patientData.dob);

          const dob = patientData.dob ? patientData.dob.split('T')[0] : '';

          const visitDate = patientData.visitDate ? patientData.visitDate.split('T')[0] : '';



          this.patientForm.patchValue({

            patientName: patientData.patientName,

            mobileNo: patientData.mobileNo,

            gender: patientData.gender,

            dob: dob,

            bloodGroup: patientData.bloodGroup,

            email: patientData.email,

            state: patientData.state,

            city: patientData.city,

            pincode: patientData.pincode,

            address: patientData.address,

            visitDate: visitDate,

            referenceBy: patientData.referenceBy.id,

            purposeForVisit: patientData.purposeForVisit,

            chiefComplaints: patientData.chiefComplaints,

            remarks: patientData.remarks

          });

        }

      },

      error: (error: any) => {

        console.error(error);

        this.loadingCities = false;

      }

    });

  }

  // ============================================================
  // Validate Date of Birth
  // ============================================================

  validateDob(): boolean {

    const dob = this.f['dob'].value;

    if (!dob) {
      return true;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {

      this.toastr.error('Date of Birth cannot be greater than today.');

      this.patientForm.patchValue({
        dob: ''
      });

      return false;

    }

    return true;

  }

  // ============================================================
  // Allow Numbers Only
  // ============================================================

  onlyNumber(event: KeyboardEvent): void {

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
  // Mobile Input
  // ============================================================

  onMobileInput(event: any): void {

    let value = event.target.value || '';

    value = value.replace(/\D/g, '');

    if (value.length > 10) {

      value = value.substring(0, 10);

    }

    this.patientForm.patchValue({

      mobileNo: value

    });

  }

  // ============================================================
  // Update Patient
  // ============================================================

  updatePatient(): void {

    if (!this.validateDob()) {
      return;
    }

    if (this.patientForm.invalid) {

      this.patientForm.markAllAsTouched();

      this.scrollToFirstInvalidControl();

      return;

    }

    const payload = {

      id: this.patientId,

      patientName: this.patientForm.value.patientName?.trim(),

      mobileNo: this.patientForm.value.mobileNo,

      gender: this.patientForm.value.gender,

      dob: this.patientForm.value.dob,

      bloodGroup: this.patientForm.value.bloodGroup,

      email: this.patientForm.value.email?.trim()?.toLowerCase(),

      state: this.patientForm.value.state,

      city: this.patientForm.value.city,

      pincode: this.patientForm.value.pincode,

      address: this.patientForm.value.address?.trim(),

      visitDate: this.patientForm.value.visitDate,

      referenceBy: this.patientForm.value.referenceBy,

      purposeForVisit: this.patientForm.value.purposeForVisit?.trim(),

      chiefComplaints: this.patientForm.value.chiefComplaints?.trim(),

      remarks: this.patientForm.value.remarks?.trim()

    };

    this.apiService.put('/patient/edit', payload, true).subscribe({

      next: (response: any) => {
        this.toastr.success(response.message || 'Patient updated successfully.');

        this.router.navigate(['/patient/list']);

      },

      error: (error: any) => {

        console.error(error);

        if (error?.error?.message) {

          if (typeof error.error.message === 'string') {

            this.toastr.error(error.error.message);

          } else {

            const firstKey = Object.keys(error.error.message)[0];

            this.toastr.error(error.error.message[firstKey]?.message || 'Validation failed.');

          }

        } else {

          this.toastr.error('Something went wrong. Please try again.');

        }

      }

    });

  }

  // ============================================================
  // Scroll To First Invalid Control
  // ============================================================

  private scrollToFirstInvalidControl(): void {

    setTimeout(() => {

      const firstInvalid = document.querySelector(

        '.ng-invalid'

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
  // Reset Form
  // ============================================================

  resetForm(): void {

    this.patientForm.reset();

    this.cities = [];

  }

  // ============================================================
  // Back
  // ============================================================

  back(): void {

    this.router.navigate([

      '/patient/list'

    ]);

  }

}