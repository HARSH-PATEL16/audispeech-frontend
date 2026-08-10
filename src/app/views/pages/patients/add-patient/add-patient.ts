import { ChangeDetectorRef,Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { ApiService } from '../../../../services/api-service/api.service';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

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
  selector: 'app-add-patient',
  standalone: true,
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.scss'],
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
export class AddPatientComponent implements OnInit {

  patientForm!: FormGroup;

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

  states: State[] = [];

  cities: City[] = [];

  doctors: Doctor[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {

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
        [
          Validators.pattern(/^[1-9][0-9]{5}$/)
        ]
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
        this.today(),
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

  ngOnInit(): void {

    this.loadInitialData();

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

    this.loadStates();

    this.loadDoctors();

  }

  // ============================================================
  // Load Doctors
  // ============================================================

  loadDoctors(): void {

    this.loader = true;

    this.apiService.get('/doctor/lists', true).subscribe({

      next: (response: any) => {
        console.log('response: ', response);
          this.loader = false;

        this.doctors = response.data || [];


        this.cdr.detectChanges();

      },

      error: (error: any) => {

        this.loader = false;
        console.error('Doctor Load Error', error);

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

        console.error('State Load Error', error);

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

    if (!stateId) {

      this.cities = [];

      return;

    }

    this.loadCities(stateId);

  }

  // ============================================================
  // Load Cities
  // ============================================================

  loadCities(stateId: number): void {

    this.apiService.get(

      `/cities/byState?stateId=${stateId}`,

      true

    ).subscribe({

      next: (response: any) => {

        this.cities = response.data || [];

      },

      error: (error: any) => {

        console.error('City Load Error', error);

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

      this.toastr.error('Date of Birth cannot be in the future.');

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
  // Save Patient
  // ============================================================

  savePatient(): void {

    
    if (!this.validateDob()) {
      return;
    }
    
    if (this.patientForm.invalid) {

      this.patientForm.markAllAsTouched();

      this.scrollToFirstInvalidControl();
      
      return;
      
    }

    this.loader = true;

    const payload = {

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

    this.apiService.post('/patient/add', payload, true).subscribe({

      next: (response: any) => {

        this.loader = false;

        this.toastr.success(response.message || 'Patient added successfully.');

        this.router.navigate(['/patient/list']);

      },

      error: (error: any) => {

        this.loader = false;

        if (error?.error?.message) {

          if (typeof error.error.message === 'string') {

            this.toastr.error(error.error.message || 'Something went wrong.');

          } else {

            const firstKey = Object.keys(error.error.message)[0];

            this.toastr.error(error.error.message[firstKey]?.message || 'Validation failed');

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

    this.patientForm.reset({

      visitDate: this.today()

    });

    this.cities = [];

  }

  // ============================================================
  // Back
  // ============================================================

  back(): void {

    this.router.navigate(['/patient/list']);

  }

}