import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api-service/api.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from '../../../../views/pages/loader/loader';
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

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

import { AudiogramChartComponent } from '../audiogram-chart/audiogram-chart';


// ======================================================
// MERGED AUDIOGRAM MODEL
// ======================================================

export type Ear = 'left' | 'right';

export type Conduction = 'AC' | 'BC';


export interface AudiogramReading {

  ear: Ear;

  conduction: Conduction;

  frequency: number;

  dB: number | null;

  masked: boolean;

  noResponse: boolean;

  rowKey: string;

}



export interface RowType {

  key: string;

  label: string;

  conduction: Conduction;

  masked: boolean;

  noResponse: boolean;

}



// ======================================================
// FREQUENCIES
// ======================================================


export const FREQUENCIES = [

  250,
  500,
  1000,
  2000,
  4000,
  8000

] as const;



export const EAR_COLOR = {

  left: '#0070C0',

  right: '#FF0000'

} as const;



// ======================================================
// TABLE ROWS
// ======================================================


export const ROW_TYPES: RowType[] = [

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




// ======================================================
// CREATE EMPTY READINGS
// ======================================================


export function createEmptyReadings(): AudiogramReading[] {


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


          conduction: row.conduction,


          frequency: freq,


          dB: null,


          masked: row.masked,


          noResponse: row.noResponse,


          rowKey: row.key


        });


      });


    });


  });



  return readings;


}




// ======================================================
// PATIENT
// ======================================================


interface Patient {

  id: string;

  name: string;

  age: number;

  gender: string;

  mobile_no: string;

  visit_date: string;

}

// ======================================================
// DOCTOR
// ======================================================

interface Doctor {

  id: string;

  name: string;

}

@Component({

  selector: 'app-edit-audiogram',

  standalone: true,

  templateUrl: './edit-audiogram.html',

  styleUrls: ['./edit-audiogram.scss'],

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


export class EditAudiogramComponent implements OnInit {



  audiogramForm!: FormGroup;



  readonly rowTypes = ROW_TYPES;


  readonly frequencies = FREQUENCIES;

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



  readings: AudiogramReading[] = createEmptyReadings();



  selectedPatient?: Patient;



  showChartModal = false;



  showAudiogramEntry = false;


  patientId?: string;

  audiogramId?: string;



  patients: Patient[] = [];

  doctors: Doctor[] = [];

  isViewMode = false;




  constructor(

    private fb: FormBuilder,

    private router: Router,

    private route: ActivatedRoute,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef,

    private toastr: ToastrService

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

      otoscopyRight: [''],


      otoscopyLeft: [''],



      rinneRight: [''],


      rinneLeft: [''],


      weber: [''],



      ptaAverageRight: [0],


      ptaAverageLeft: [0],



      reliabilityGood: [false],


      reliabilityFair: [false],


      reliabilityPoor: [false],



      inventis: [false],


      interacoustic: [false],



      interpretationRight: [''],


      interpretationLeft: [''],



      recommendEnt: [false],


      recommendCare: [false],


      recommendHat: [false],


      recommendFollowUp: [false]


    });



  }






  ngOnInit(): void {


    const id =
      this.route.snapshot.paramMap.get('id');


    const mode =
      this.route.snapshot.queryParamMap.get('mode');


    this.isViewMode =
      mode === 'view';

    // Load doctors for both edit and view
    this.loadDoctors();

    if (id) {

      if (this.isViewMode) {

        this.audiogramId = id;

        this.loadHistoryAudiogram(id);

      }
      else {

        this.patientId = id;

        this.loadPatients(id);

      }

    }

  }






  // ======================================================
  // LOAD EXISTING RECORD
  // ======================================================


  loadAudiogram(id: string): void {
    this.loader = true;
    this.apiService.get(`/audiogram/patient/details?patientId=${id}`, true)
      .subscribe({
        next: (response: any) => {

          this.loader = false;

          const data = response.data;
          // console.log('data: ', data);

          this.audiogramId = data.id;

          // Patch form values
          this.audiogramForm.patchValue({
            patientId: data.patient_id,

            doctorId: data.doctor_id,

            otoscopyRight: data.otoscopy_right,
            otoscopyLeft: data.otoscopy_left,

            rinneRight: data.tft_rinne_right,
            rinneLeft: data.tft_rinne_left,
            weber: data.tft_weber,

            ptaAverageRight: Number(data.pta_avg_right),
            ptaAverageLeft: Number(data.pta_avg_left),

            reliabilityGood: data.reliability_good,
            reliabilityFair: data.reliability_fair,
            reliabilityPoor: data.reliability_poor,

            inventis: data.inventis,
            interacoustic: data.interacoustic,

            interpretationRight: data.interpretation_right,
            interpretationLeft: data.interpretation_left,

            recommendEnt: data.recommend_ent,
            recommendCare: data.recommend_care,
            recommendHat: data.recommend_hat,
            recommendFollowUp: data.recommend_follow_up
          });

          // Select patient
          this.selectedPatient = this.patients.find(
            p => p.id === data.patient_id
          );

          // Patch audiogram readings
          // Audiogram readings
          this.readings = Array.isArray(data.readings)
            ? data.readings
            : createEmptyReadings();

          this.readings = [...this.readings];

          // this.calculatePTA();

          this.showAudiogramEntry = true;

          if (this.isViewMode) {

            this.audiogramForm.disable();

          }


        },
        error: (err) => {
          this.loader = false;
          console.error(err);
        }
      });
  }


  // loadHistoryAudiogram(id: string): void {

  //   this.loader = true;
  //   this.apiService
  //     .get(`/audiogram/history/details?historyId=${id}`, true)
  //     .subscribe({

  //       next: (response: any) => {

  //         this.loader = false;


  //         const data = response.data;
  //         // console.log('data: ', data);


  //         this.audiogramId = data.audiogram_id;



  //         this.audiogramForm.patchValue({

  //           patientId: data.patient_id,

  //           doctorId: data.doctor_id,

  //           otoscopyRight: data.otoscopy_right,

  //           otoscopyLeft: data.otoscopy_left,


  //           rinneRight: data.tft_rinne_right,

  //           rinneLeft: data.tft_rinne_left,

  //           weber: data.tft_weber,


  //           ptaAverageRight: Number(data.pta_avg_right),

  //           ptaAverageLeft: Number(data.pta_avg_left),


  //           reliabilityGood: data.reliability_good,

  //           reliabilityFair: data.reliability_fair,

  //           reliabilityPoor: data.reliability_poor,


  //           inventis: data.inventis,

  //           interacoustic: data.interacoustic,


  //           interpretationRight: data.interpretation_right,

  //           interpretationLeft: data.interpretation_left,


  //           recommendEnt: data.recommend_ent,

  //           recommendCare: data.recommend_care,

  //           recommendHat: data.recommend_hat,

  //           recommendFollowUp: data.recommend_follow_up

  //         });



  //         this.selectedPatient = data.audiogram.patient;

  //         this.patients = [
  //           data.patient
  //         ];


  //         this.audiogramForm.patchValue({

  //           patientId: data.audiogram.patient.id

  //         });

  //         this.readings =
  //           data.readings || createEmptyReadings();



  //         this.showAudiogramEntry = true;



  //         if (this.isViewMode) {

  //           this.audiogramForm.disable();

  //         }


  //         this.cdr.detectChanges();


  //       },


  //       error: (err) => {
  //         this.loader = false;
  //         console.error(err);

  //       }


  //     });


  // }


  // ======================================================
  // PATIENT CHANGE
  // ======================================================

  loadHistoryAudiogram(id: string): void {
    this.loader = true;

    this.apiService
      .get(`/audiogram/history/details?historyId=${id}`, true)
      .subscribe({
        next: (response: any) => {
          const data = response.data;

          this.audiogramId = data.audiogram_id;

          // --------------------------------------------------
          // Set patient FIRST
          // --------------------------------------------------

          const patient: Patient =
            data.patient ||
            data.audiogram?.patient;

          this.selectedPatient = patient;

          // Make sure select has the patient option
          this.patients = patient ? [patient] : [];

          // --------------------------------------------------
          // Patch form
          // --------------------------------------------------

          this.audiogramForm.patchValue({
            patientId: patient?.id ?? '',
            doctorId: data.doctor_id ?? '',

            otoscopyRight: data.otoscopy_right ?? '',
            otoscopyLeft: data.otoscopy_left ?? '',

            rinneRight: data.tft_rinne_right ?? '',
            rinneLeft: data.tft_rinne_left ?? '',
            weber: data.tft_weber ?? '',

            ptaAverageRight:
              data.pta_avg_right != null
                ? Number(data.pta_avg_right)
                : null,

            ptaAverageLeft:
              data.pta_avg_left != null
                ? Number(data.pta_avg_left)
                : null,

            reliabilityGood: !!data.reliability_good,
            reliabilityFair: !!data.reliability_fair,
            reliabilityPoor: !!data.reliability_poor,

            inventis: !!data.inventis,
            interacoustic: !!data.interacoustic,

            interpretationRight: data.interpretation_right ?? '',
            interpretationLeft: data.interpretation_left ?? '',

            recommendEnt: !!data.recommend_ent,
            recommendCare: !!data.recommend_care,
            recommendHat: !!data.recommend_hat,
            recommendFollowUp: !!data.recommend_follow_up
          });

          // --------------------------------------------------
          // Readings
          // --------------------------------------------------

          this.readings = Array.isArray(data.readings)
            ? [...data.readings]
            : createEmptyReadings();

          // --------------------------------------------------
          // Show content
          // --------------------------------------------------

          this.showAudiogramEntry = true;

          if (this.isViewMode) {
            this.audiogramForm.disable({ emitEvent: false });
          }

          this.loader = false;

          // Force immediate Angular rendering
          this.cdr.detectChanges();
        },

        error: (err) => {
          this.loader = false;
          console.error(err);

          this.toastr.error(
            err?.error?.message || 'Failed to load audiogram'
          );

          this.cdr.detectChanges();
        }
      });
  }


  loadPatients(audiogramPatientId?: string): void {
    this.loader = true;
    this.apiService.get('/patient/lists', true).subscribe({

      next: (response: any) => {

        this.loader = false;

        this.patients = response.data || [];

        this.cdr.detectChanges();

        if (audiogramPatientId) {

          this.loadAudiogram(audiogramPatientId);

        }

      },

      error: (err) => {

        this.loader = false;

        console.error(err);

      }

    });

  }


  patientChanged(): void {

    const id = this.audiogramForm.value.patientId;

    this.selectedPatient =
      this.patients.find(x => x.id === id);

    this.showAudiogramEntry = !!this.selectedPatient;

  }

  // ======================================================
  // LOAD DOCTORS
  // ======================================================

  loadDoctors(): void {

    this.apiService
      .get('/doctor/lists', true)
      .subscribe({

        next: (response: any) => {

          this.doctors = response.data || [];

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error('Failed to load doctors:', err);

          this.doctors = [];

        }

      });

  }


  // ======================================================
  // READING FIND
  // ======================================================


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





  // ======================================================
  // UPDATE TABLE VALUE
  // ======================================================


  // ======================================================
  // UPDATE TABLE VALUE
  // ======================================================

  updateReading(
    ear: Ear,
    rowKey: string,
    frequency: number,
    value: string
  ): void {

    if (this.isViewMode) {
      return;
    }


    const reading = this.getReading(
      ear,
      rowKey,
      frequency
    );


    if (!reading) {
      return;
    }


    // ======================================================
    // EMPTY VALUE
    // ======================================================

    if (value === '') {

      reading.dB = null;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // ======================================================
    // CONVERT VALUE
    // ======================================================

    const numericValue = Number(value);


    // ======================================================
    // INVALID NUMBER
    // ======================================================

    if (isNaN(numericValue)) {

      reading.dB = null;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // ======================================================
    // MAXIMUM 130 dB
    // ======================================================

    if (numericValue > 130) {

      this.toastr.warning('Audiogram value cannot be greater than 130 dB.');

      reading.dB = 130;

      this.readings = [
        ...this.readings
      ];

      this.calculatePTA();

      return;
    }


    // ======================================================
    // MINIMUM 0 dB
    // ======================================================

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


    // ======================================================
    // VALID VALUE
    // ======================================================

    reading.dB = numericValue;


    // ======================================================
    // CREATE NEW ARRAY REFERENCE
    // ======================================================

    this.readings = [
      ...this.readings
    ];


    // ======================================================
    // RECALCULATE PTA
    // ======================================================

    this.calculatePTA();

  }





  // ======================================================
  // PTA CALCULATION
  // ======================================================


  private calculatePTA(): void {



    this.calculateEarPTA('left');


    this.calculateEarPTA('right');


  }






  private calculateEarPTA(

    ear: Ear

  ): void {



    const frequencies = [

      500,

      1000,

      2000

    ];





    const values = frequencies


      .map(freq =>


        this.getReading(

          ear,

          'ac',

          freq

        )?.dB


      )


      .filter(value =>


        value !== null &&

        value !== undefined


      ) as number[];






    const controlName = ear === 'left'

      ? 'ptaAverageLeft'

      : 'ptaAverageRight';







    if (values.length === 0) {



      this.audiogramForm.patchValue({

        [controlName]: null

      });



      return;

    }







    const average =


      values.reduce(

        (a, b) => a + b,

        0

      )

      /

      values.length;







    this.audiogramForm.patchValue({


      [controlName]:

        Number(

          average.toFixed(2)

        )


    });

  }





  // ======================================================
  // CHART MODAL
  // ======================================================


  openChartModal(): void {


    this.showChartModal = true;


  }





  closeChartModal(): void {


    this.showChartModal = false;


  }


  // ======================================================
  // UPDATE AUDIOGRAM
  // ======================================================


  updateAudiogram(): void {


    if (this.audiogramForm.invalid) {
      this.audiogramForm.markAllAsTouched();
      return;
    }

    // ======================================================
    // AUDIOGRAM dB RANGE VALIDATION
    // ======================================================

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

      id: this.audiogramId,

      patient: this.selectedPatient,

      doctorId: this.audiogramForm.value.doctorId,

      readings: this.readings,

      otoscopy: {
        right: this.audiogramForm.value.otoscopyRight,
        left: this.audiogramForm.value.otoscopyLeft
      },

      tft: {
        rinneRight: this.audiogramForm.value.rinneRight,
        rinneLeft: this.audiogramForm.value.rinneLeft,
        weber: this.audiogramForm.value.weber
      },

      pta: {
        right: this.audiogramForm.value.ptaAverageRight,
        left: this.audiogramForm.value.ptaAverageLeft
      },

      reliability: {
        good: this.audiogramForm.value.reliabilityGood,
        fair: this.audiogramForm.value.reliabilityFair,
        poor: this.audiogramForm.value.reliabilityPoor
      },

      audiometer: {
        inventis: this.audiogramForm.value.inventis,
        interacoustic: this.audiogramForm.value.interacoustic
      },

      interpretation: {
        right: this.audiogramForm.value.interpretationRight,
        left: this.audiogramForm.value.interpretationLeft
      },

      recommendation: {
        ent: this.audiogramForm.value.recommendEnt,
        care: this.audiogramForm.value.recommendCare,
        hat: this.audiogramForm.value.recommendHat,
        followUp: this.audiogramForm.value.recommendFollowUp
      }

    };

    // console.log(payload);

    this.apiService.put('/audiogram/edit', payload, true)
      .subscribe({

        next: (response: any) => {

          this.loader = false;

          if (response.success == 1) {

            this.toastr.success(response.message);

            this.router.navigate(['/audiogram']);

          } else {
            this.toastr.error(response?.message);
          }

        },

        error: (err) => {

          this.loader = false;

          console.error(err);

          this.toastr.error(
            err?.error?.message || 'Something went wrong'
          );

        }

      });

  }







  // ======================================================
  // NAVIGATION
  // ======================================================


  back(): void {


    if (this.isViewMode) {

      this.router.navigate([
        '/audiogram/history',
        this.audiogramId
      ]);

    } else {
      this.router.navigate([


        '/audiogram'


      ]);
    }

  }






  // ======================================================
  // RESET
  // ======================================================


  reset(): void {



    this.readings = createEmptyReadings();



    this.audiogramForm.reset({



      reliabilityGood: false,


      reliabilityFair: false,


      reliabilityPoor: false,



      inventis: false,


      interacoustic: false,



      recommendEnt: false,


      recommendCare: false,


      recommendHat: false,


      recommendFollowUp: false



    });



  }



}