import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { ToastrService } from 'ngx-toastr';

import {
  ButtonDirective,
  ContainerComponent
} from '@coreui/angular';

import { AudiogramChartComponent } from '../../../audiogram/audiogram-chart/audiogram-chart';
import { ApiService } from '../../../../../services/api-service/api.service';

import {
  AudiogramReading,
  ROW_TYPES,
  FREQUENCIES,
  createEmptyReadings
} from '../../../../../models/audiogram.model';

import { LoaderComponent } from '../../../../pages/loader/loader';

/* =====================================================
   Interfaces
===================================================== */

interface Company {
  name: string;
  slogan: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface Patient {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  mobileNo: string;
  doctor: string;
  visitDate: string;
  address: string;
  purpose: string;
}

interface CheckboxItem {
  name: string;
  selected: boolean;
}

interface ReportData {

  patient: Patient;

  readings: AudiogramReading[];

  otoscopy: {
    right: string;
    left: string;
  };

  tft: {
    rinneRight: string;
    rinneLeft: string;
    weber: string;
  };

  ptaAverage: {
    right: number;
    left: number;
  };

  reliability: CheckboxItem[];

  audiometerUsed: CheckboxItem[];

  recommendations: CheckboxItem[];

  remarks: string;

  doctorSignature: string;
}

@Component({
  selector: 'app-report-view',
  standalone: true,
  templateUrl: './report-view.html',
  styleUrls: ['./report-view.scss'],
  imports: [
    CommonModule,
    ContainerComponent,
    ButtonDirective,
    AudiogramChartComponent,
    LoaderComponent
  ]
})
export class ReportViewComponent implements OnInit {

  readonly rowTypes = ROW_TYPES;
  readonly frequencies = FREQUENCIES;

  reportId!: any;

  companyId: string = '1191770e-ae8b-44c3-a9f3-096991257db2';

  company!: Company;

  report!: ReportData;

  rightInterpretation = '';

  leftInterpretation = '';

  loader = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {

    this.reportId = this.route.snapshot.paramMap.get('id')

    this.loadCompany();

    this.loadReport();
  }
  /*==================================================
COMPANY
==================================================*/

  loadCompany(): void {
    this.loader = true;
    // Static company id was used
    this.apiService.get(`/company/details?id=${this.companyId}`, true)

      .subscribe({

        next: (res: any) => {

          this.loader = false;

          if (res.success === 1) {
            const company = res.data;
            console.log('company: ', company);

            this.company = {

              name: company.name,

              slogan: company.slogan,

              logo: company.logo,

              address: company.address,

              phone: company.contact_number,

              email: company.email,

              website: company.website

            };
          }

          this.cdr.detectChanges();
        },
        error: err => {

          this.loader = false;
          console.error(
            'Company load error',
            err
          );
        }

      });

  }

  /*==================================================
  REPORT
  ==================================================*/

  loadReport(): void {

    this.apiService
      .get(`/audiogram/report/details?audiogramHistoryId=${this.reportId}`, true)
      .subscribe({

        next: (response: any) => {

          const data = response.data;



          const readings = createEmptyReadings();


          (data.readings ?? []).forEach((apiReading: any) => {

            const reading = readings.find(r =>
              r.ear === apiReading.ear &&
              r.rowKey === apiReading.rowKey &&
              r.frequency === apiReading.frequency
            );


            if (reading) {

              reading.dB = apiReading.dB;

              reading.masked = apiReading.masked;

              reading.noResponse = apiReading.noResponse;

              reading.conduction = apiReading.conduction;

            }

          });

          let doctorData = data.patient.doctor

          this.report = {

            patient: {

              patientId: data.patient.id,

              patientName: data.patient.name,

              age: data.patient.age,

              gender:
                data.patient.gender === 0
                  ? 'Male'
                  : 'Female',

              mobileNo: data.patient.mobile_no,

              doctor:
                doctorData.name ?? '',

              visitDate:
                data.patient.visit_date,

              address:
                data.patient.address ?? '',

              purpose:
                data.patient.chief_complaint ?? ''

            },


            readings,


            otoscopy: {

              right:
                data.otoscopy_right ?? '',

              left:
                data.otoscopy_left ?? ''

            },


            tft: {

              rinneRight:
                data.tft_rinne_right ?? '',

              rinneLeft:
                data.tft_rinne_left ?? '',

              weber:
                data.tft_weber ?? ''

            },


            ptaAverage: {

              right:
                Number(data.pta_avg_right ?? 0),

              left:
                Number(data.pta_avg_left ?? 0)

            },


            reliability: [

              {
                name: 'Good',
                selected: data.reliability_good
              },

              {
                name: 'Fair',
                selected: data.reliability_fair
              },

              {
                name: 'Poor',
                selected: data.reliability_poor
              }

            ],


            audiometerUsed: [

              {
                name: 'Inventis',
                selected: data.inventis
              },

              {
                name: 'Interacoustics',
                selected: data.interacoustic
              },

            ],


            recommendations: [

              {
                name: 'ENT Consultation',
                selected: data.recommend_ent
              },

              {
                name: 'Care of Ear',
                selected: data.recommend_care
              },

              {
                name: 'Hearing Aid Trial',
                selected: data.recommend_hat
              },

              {
                name: 'Follow Up',
                selected: data.recommend_follow_up
              }

            ],


            remarks:
              `Right: ${data.interpretation_right ?? ''} 
             Left: ${data.interpretation_left ?? ''}`,


            doctorSignature: data.doctor_signature ?? '',

          };



          this.rightInterpretation =
            data.interpretation_right ?? '';

          this.leftInterpretation =
            data.interpretation_left ?? '';



          console.log(
            'Dynamic Report:',
            this.report
          );


          this.cdr.detectChanges();

        },


        error: (err) => {
          console.error(
            'Audiogram details error:',
            err
          );

        }

      });

  }

  /*==================================================
  TABLE VALUE
  ==================================================*/

  getReadingValue(
    ear: 'left' | 'right',
    rowKey: string,
    frequency: number
  ): string {

    const reading = this.report.readings.find(r =>
      r.ear === ear &&
      r.rowKey === rowKey &&
      r.frequency === frequency
    );

    return reading?.dB != null
      ? reading.dB.toString()
      : '-';
  }

  /*==================================================
PRINT REPORT
==================================================*/

  printReport(): void {

    window.print();

  }


  /*==================================================
  DOWNLOAD PDF
  ==================================================*/

  downloadPdf(): void {

    const report = document.getElementById('reportContent');

    if (!report) {
      return;
    }

    const actionBar = document.querySelector('.action-bar') as HTMLElement;

    if (actionBar) {
      actionBar.style.display = 'none';
    }

    html2canvas(report, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    }).then(canvas => {

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const canvasRatio = canvas.height / canvas.width;

      // Fit the whole report onto a single A4 page: scale to width first,
      // and if that would overflow the page height, scale to height instead
      // so nothing gets cut off and no second page is ever created.
      let imgWidth = pageWidth;
      let imgHeight = pageWidth * canvasRatio;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = pageHeight / canvasRatio;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        x,
        y,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );

      const now = new Date();

      const patientName = this.report.patient.patientName.trim();

      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');

      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const hour = hours.toString().padStart(2, '0');

      const fileName =
        `${patientName} - ${day}-${month}-${year} - ${hour}-${minutes} ${ampm}.pdf`;

      pdf.save(fileName);

      this.toastr.success('Audiogram report downloaded successfully.');

      if (actionBar) {
        actionBar.style.display = 'flex';
      }

    });

  }


  /*==================================================
  BACK
  ==================================================*/

  back(): void {

    this.router.navigate([
      '/report/audiogram'
    ]);

  }


}