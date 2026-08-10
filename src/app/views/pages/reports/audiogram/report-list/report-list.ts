import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../../services/api-service/api.service';
import { LoaderComponent } from '../../../../pages/loader/loader';


import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

interface AudiogramReport {

  id: number;

  patientName: string;

  mobileNo: string;

  doctor: string;

  visitDate: string;

  status: string;

}

@Component({

  selector: 'app-report-list',

  standalone: true,

  templateUrl: './report-list.html',

  styleUrls: ['./report-list.scss'],

  imports: [

    CommonModule,

    FormsModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    ButtonDirective,
    LoaderComponent

  ]

})

export class ReportListComponent implements OnInit {

  searchText = '';

  selectedDoctor = '';

  fromDate = '';

  toDate = '';

  doctors = [];

  reports: AudiogramReport[] = [];

  audiograms: any = [];

  filteredReports: AudiogramReport[] = [];

  pagedReports: AudiogramReport[] = [];

  pageSize = 10;

  currentPage = 1;

  totalPages = 1;

  sortColumn = 'visitDate';

  sortDirection = 'desc';

  loader= false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {


    this.loadAudiograms();

  }


  loadAudiograms(): void {
    this.loader = true;
    this.apiService.get('/audiogram/report/list', true).subscribe({
      next: (response: any) => {

        this.loader = false;

        this.audiograms = response?.data || [];
        console.log('this.audiograms: ', this.audiograms);

        this.filteredReports = [...this.audiograms];

        this.currentPage = 1;

        this.updatePagination();

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loader = false;
        console.error('Error loading audiograms', err);
      }
    });
  }

  search(): void {

    this.filteredReports = this.audiograms.filter((report: any) => {

      const search = this.searchText.toLowerCase();

      const matchesSearch =
        (report.patientName ?? '').toLowerCase().includes(search) ||
        (report.mobileNo ?? '').includes(search);

      const matchesDoctor =
        !this.selectedDoctor ||
        report.doctor === this.selectedDoctor;

      const matchesFrom =
        !this.fromDate ||
        report.visitDate >= this.fromDate;

      const matchesTo =
        !this.toDate ||
        report.visitDate <= this.toDate;

      return (
        matchesSearch &&
        matchesDoctor &&
        matchesFrom &&
        matchesTo
      );

    });

    this.currentPage = 1;

    this.updatePagination();

  }

  resetFilters(): void {

    this.searchText = '';
    this.selectedDoctor = '';
    this.fromDate = '';
    this.toDate = '';

    this.filteredReports = [...this.audiograms];

    this.currentPage = 1;

    this.updatePagination();

  }

  sort(column: keyof AudiogramReport): void {

    if (this.sortColumn === column) {

      this.sortDirection =

        this.sortDirection === 'asc'

          ? 'desc'

          : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }

    this.filteredReports.sort((a: any, b: any) => {

      if (a[column] < b[column])

        return this.sortDirection === 'asc' ? -1 : 1;

      if (a[column] > b[column])

        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;

    });

    this.updatePagination();

  }

  updatePagination(): void {

    this.totalPages =

      Math.ceil(

        this.filteredReports.length /

        this.pageSize

      ) || 1;

    const start =

      (this.currentPage - 1) *

      this.pageSize;

    this.pagedReports =

      this.filteredReports.slice(

        start,

        start + this.pageSize

      );

  }

  nextPage(): void {

    if (

      this.currentPage <

      this.totalPages

    ) {

      this.currentPage++;

      this.updatePagination();

    }

  }

  previousPage(): void {

    if (

      this.currentPage > 1

    ) {

      this.currentPage--;

      this.updatePagination();

    }

  }

  pageSizeChanged(): void {

    this.currentPage = 1;

    this.updatePagination();

  }

  get startRecord(): number {

    if (!this.filteredReports.length)

      return 0;

    return (

      (this.currentPage - 1) *

      this.pageSize +

      1

    );

  }

  get endRecord(): number {

    return Math.min(

      this.currentPage *

      this.pageSize,

      this.filteredReports.length

    );

  }

  preview(report: AudiogramReport): void {

    console.log(

      'Preview',

      report

    );

    this.router.navigate(['/report/audiogram/report-view', report?.id]);

    // Navigate to report preview

  }

  downloadPdf(report: AudiogramReport): void {

    console.log(

      'Download PDF',

      report

    );

  }

  print(report: AudiogramReport): void {

    console.log(

      'Print',

      report

    );

  }

}