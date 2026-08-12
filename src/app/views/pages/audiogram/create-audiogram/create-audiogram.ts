import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

import { AudiogramChartComponent } from '../audiogram-chart/audiogram-chart';
import { ApiService } from '../../../../services/api-service/api.service';
import { ToastrService } from 'ngx-toastr';


// =====================================================
// AUDIOGRAM MODEL (MERGED)
// =====================================================

type Ear = 'left' | 'right';

type Conduction = 'AC' | 'BC';


interface AudiogramReading {

  ear: Ear;

  conduction: Conduction;

  frequency: number;

  dB: number | null;

  masked: boolean;

  noResponse: boolean;

  rowKey: string;

}


interface RowType {

  key: string;

  label: string;

  conduction: Conduction;

  masked: boolean;

  noResponse: boolean;

}


const FREQUENCIES = [

  250,

  500,

  1000,

  2000,

  4000,

  8000

] as const;



const ROW_TYPES: RowType[] = [

  {
    key: 'ac',
    label: 'AC',
    conduction: 'AC',
    masked: false,
    noResponse: false
  },

  {
    key: 'bc',
    label: 'BC',
    conduction: 'BC',
    masked: false,
    noResponse: false
  },

  {
    key: 'ac_mask',
    label: 'AC MASKING',
    conduction: 'AC',
    masked: true,
    noResponse: false
  },

  {
    key: 'bc_mask',
    label: 'BC MASKING',
    conduction: 'BC',
    masked: true,
    noResponse: false
  },

  {
    key: 'ac_nr',
    label: 'AC (N.R.)',
    conduction: 'AC',
    masked: false,
    noResponse: true
  },

  {
    key: 'bc_nr',
    label: 'BC (N.R.)',
    conduction: 'BC',
    masked: false,
    noResponse: true
  },

  {
    key: 'ac_mask_nr',
    label: 'AC MASKING (N.R.)',
    conduction: 'AC',
    masked: true,
    noResponse: true
  },

  {
    key: 'bc_mask_nr',
    label: 'BC MASKING (N.R.)',
    conduction: 'BC',
    masked: true,
    noResponse: true
  },

  {
    key: 'ac_without_mask',
    label: 'AC WITHOUT MASKING',
    conduction: 'AC',
    masked: false,
    noResponse: false
  }

];



function createEmptyReadings(): AudiogramReading[] {

  const readings: AudiogramReading[] = [];

  const ears: Ear[] = [

    'left',

    'right'

  ];


  ears.forEach(ear => {

    ROW_TYPES.forEach(row => {


      FREQUENCIES.forEach(freq => {


        readings.push({

          ear,

          frequency: freq,

          conduction: row.conduction,

          masked: row.masked,

          noResponse: row.noResponse,

          rowKey: row.key,

          dB: null

        });


      });


    });


  });


  return readings;

}



// =====================================================
// PATIENT
// =====================================================


interface Patient {

  id: string;

  name: string;

  age: number;

  gender: string;

  mobile_no: string;

  visit_date: string;

}


interface Doctor {

  id: string;

  name: string;

  mobile_no?: string;

  email?: string;

}




@Component({

  selector: 'app-create-audiogram',

  standalone: true,

  templateUrl: './create-audiogram.html',

  styleUrls: ['./create-audiogram.scss'],

  imports: [

    CommonModule,

    ReactiveFormsModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    ButtonDirective,

    AudiogramChartComponent,
    LoaderComponent

  ]

})


export class CreateAudiogramComponent {


  audiogramForm!: FormGroup;


  readonly rowTypes = ROW_TYPES;


  readonly frequencies = FREQUENCIES;


  readings: AudiogramReading[] = createEmptyReadings();


  selectedPatient?: Patient;


  showChartModal = false;


  showAudiogramEntry = false;

  loader = false;


  readonly rinneOptions = [

    '+Ve',

    '-Ve',

    '(F) +Ve',

    '(F) -Ve',

    'N.R.'

  ];


  readonly weberOptions = [

    '<---------',

    '--------->',

    '----> <----',

    '<-------->',

    'N.R.'

  ];

  patients: Patient[] = [];

  doctors: Doctor[] = [];



  constructor(

    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef

  ) {


    this.audiogramForm = this.fb.group({


      patientId: [

        '',

        Validators.required

      ],

      doctorId: [

        '',

        Validators.required

      ],


      // OTOSCOPY

      otoscopyRight: [''],

      otoscopyLeft: [''],



      // TFT

      rinneRight: ['+Ve'],

      rinneLeft: ['+Ve'],

      weber: ['<-------->'],



      // PTA

      ptaAverageRight: ['0.00'],

      ptaAverageLeft: ['0.00'],



      // RELIABILITY

      reliabilityGood: [false],

      reliabilityFair: [false],

      reliabilityPoor: [false],



      // AUDIOMETER

      inventis: [false],

      interacoustic: [false],



      // INTERPRETATION

      interpretationRight: [''],

      interpretationLeft: [''],



      // RECOMMENDATION

      recommendEnt: [false],

      recommendCare: [false],

      recommendHat: [false],

      recommendFollowUp: [false]


    });


  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
  }





  // =====================================================
  // PATIENT
  // =====================================================

  loadPatients(): void {
    this.loader = true;
    this.apiService.get('/patient/lists', true).subscribe({
      next: (response: any) => {

        this.loader = false;

        // console.log('response: ', response);

        this.patients = response?.data || [];

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loader = false;
        console.error('Error loading audiograms', err);
      }
    });
  }


  patientChanged(): void {


    const id = this.audiogramForm.value.patientId



    this.selectedPatient = this.patients.find(

      x => x.id === id

    );


    this.showAudiogramEntry = !!this.selectedPatient;


  }


  // =====================================================
  // DOCTOR
  // =====================================================

  loadDoctors(): void {

    this.loader = true;

    this.apiService
      .get('/doctor/lists', true)
      .subscribe({

        next: (response: any) => {

          this.loader = false;

          this.doctors = response?.data || [];

          this.cdr.detectChanges();

        },

        error: (err) => {

          this.loader = false;

          console.error(
            'Error loading doctors',
            err
          );

        }

      });

  }



  // =====================================================
  // READINGS
  // =====================================================


  getReading(

    ear: Ear,

    rowKey: string,

    frequency: number

  ): AudiogramReading | undefined {


    return this.readings.find(

      x =>

        x.ear === ear &&

        x.rowKey === rowKey &&

        x.frequency === frequency

    );


  }


  updateReading(
    ear: Ear,
    rowKey: string,
    frequency: number,
    value: string
  ): void {

    const reading = this.getReading(
      ear,
      rowKey,
      frequency
    );

    if (!reading) {
      return;
    }

    // =====================================================
    // EMPTY VALUE
    // =====================================================

    if (value === '') {

      reading.dB = null;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // =====================================================
    // CONVERT VALUE
    // =====================================================

    const numericValue = Number(value);


    // =====================================================
    // INVALID NUMBER
    // =====================================================

    if (isNaN(numericValue)) {

      reading.dB = null;

      this.readings = [
        ...this.readings
      ];

      return;
    }


    // =====================================================
    // MAXIMUM dB VALIDATION
    // =====================================================

    if (numericValue > 130) {

      this.toastr.warning('Audiogram value cannot be greater than 130 dB.');

      reading.dB = 130;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // =====================================================
    // MINIMUM dB VALIDATION
    // =====================================================

    if (numericValue < 0) {

      this.toastr.warning(
        'Audiogram value cannot be less than 0 dB.',
        'Invalid dB Value'
      );

      reading.dB = 0;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // =====================================================
    // VALID VALUE
    // =====================================================

    reading.dB = numericValue;


    // =====================================================
    // TRIGGER CHART UPDATE
    // =====================================================

    this.readings = [
      ...this.readings
    ];


    // =====================================================
    // RECALCULATE PTA
    // =====================================================

    this.calculatePTA();

  }


  private calculatePTA(): void {


    this.calculateEarPTA('left');

    this.calculateEarPTA('right');


  }


  private calculateEarPTA(

    ear: Ear

  ): void {


    const ptaFrequency = [

      500,

      1000,

      2000

    ];



    const values = ptaFrequency

      .map(freq =>

        this.getReading(

          ear,

          'ac',

          freq

        )?.dB

      )

      .filter(

        value =>

          value !== null &&

          value !== undefined

      ) as number[];



    const controlName = ear === 'left'

      ? 'ptaAverageLeft'

      : 'ptaAverageRight';




    if (!values.length) {


      this.audiogramForm.patchValue({

        [controlName]: null

      });


      return;

    }




    const average =

      values.reduce(

        (sum, value) => sum + value,

        0

      ) / values.length;



    this.audiogramForm.patchValue({


      [controlName]:

        Number(

          average.toFixed(2)

        )


    });


  }


  // =====================================================
  // CHART MODAL
  // =====================================================


  openChartModal(): void {

    this.showChartModal = true;

  }


  closeChartModal(): void {

    this.showChartModal = false;

  }

  // =====================================================
  // SAVE
  // =====================================================


  saveAudiogram(): void {



    if (this.audiogramForm.invalid) {


      this.audiogramForm.markAllAsTouched();


      return;

    }

    // =====================================================
    // AUDIOGRAM dB RANGE VALIDATION
    // =====================================================

    const invalidReading = this.readings.find(
      reading =>
        reading.dB !== null &&
        (
          reading.dB < 0 ||
          reading.dB > 130
        )
    );


    if (invalidReading) {

      this.toastr.error(
        'Audiogram values must be between 0 and 130 dB.',
        'Invalid Audiogram Value'
      );

      return;
    }

    this.loader = true;


    const payload = {

      patientId: this.audiogramForm.value.patientId,

      doctorId: this.audiogramForm.value.doctorId,

      patient: this.selectedPatient,

      readings: this.readings,

      otoscopy: {

        right:

          this.audiogramForm.value.otoscopyRight,


        left:

          this.audiogramForm.value.otoscopyLeft

      },



      tft: {

        rinneRight:

          this.audiogramForm.value.rinneRight,


        rinneLeft:

          this.audiogramForm.value.rinneLeft,


        weber:

          this.audiogramForm.value.weber

      },



      pta: {

        right:

          this.audiogramForm.value.ptaAverageRight,


        left:

          this.audiogramForm.value.ptaAverageLeft

      },



      reliability: {

        good:

          this.audiogramForm.value.reliabilityGood,


        fair:

          this.audiogramForm.value.reliabilityFair,


        poor:

          this.audiogramForm.value.reliabilityPoor

      },



      audiometer: {

        inventis:

          this.audiogramForm.value.inventis,


        interacoustic:

          this.audiogramForm.value.interacoustic

      },



      interpretation: {

        right:

          this.audiogramForm.value.interpretationRight,


        left:

          this.audiogramForm.value.interpretationLeft

      },



      recommendation: {

        ent:

          this.audiogramForm.value.recommendEnt,


        care:

          this.audiogramForm.value.recommendCare,


        hat:

          this.audiogramForm.value.recommendHat,


        followUp:

          this.audiogramForm.value.recommendFollowUp

      }


    };



    console.log(

      'Audiogram Payload',

      payload

    );


    this.apiService.post('/audiogram/create', payload, true)
      .subscribe({
        next: (response: any) => {

          this.loader = false;

          if (response.success == 1) {
            this.toastr.success(response?.message);

            // Reset form
            this.reset();

            setTimeout(() => {
              this.router.navigate(['/audiogram']);
            }, 500);
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


  // =====================================================
  // ADD PATIENT
  // =====================================================

  addPatient(): void {

    this.router.navigate([
      '/patient/add'
    ]);

  }



  // =====================================================
  // NAVIGATION
  // =====================================================


  back(): void {


    this.router.navigate([

      '/audiogram'

    ]);


  }


  reset(): void {


    this.readings = createEmptyReadings();


    this.audiogramForm.reset();


  }



}