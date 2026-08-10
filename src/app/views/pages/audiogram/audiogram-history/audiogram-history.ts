import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

import { ApiService } from '../../../../services/api-service/api.service';

interface Patient {

  patientName: string;
  mobileNo: string;
  age: number;
  gender: number;
  visitDate: string;

}

interface AudiogramHistory {

  id: string;
  createdAt: string;
  modifiedDate?: string;
  modifiedBy?: string;

}

@Component({
  selector: 'app-audiogram-history',
  standalone: true,
  templateUrl: './audiogram-history.html',
  styleUrls: ['./audiogram-history.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    LoaderComponent
  ]
})
export class AudiogramHistoryComponent implements OnInit {

  audiogramId = '';

  patient: Patient = {
    patientName: '',
    mobileNo: '',
    age: 0,
    gender: 0,
    visitDate: ''
  };

  searchText = '';

  history: AudiogramHistory[] = [];

  filteredHistory: AudiogramHistory[] = [];

  pagedHistory: AudiogramHistory[] = [];

  pageSize = 10;

  currentPage = 1;

  totalPages = 1;

  loader= false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.audiogramId =
      this.route.snapshot.paramMap.get('id') || '';

    this.loadHistory();

  }

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  loadHistory(): void {
    this.loader = true;
    this.apiService.get(`/audiogram/history/lists?audiogramId=${this.audiogramId}`, true).subscribe({

      next: (response: any) => {

        this.loader = false;

        this.patient =
          response.patient;

        this.history =
          response.data || [];

        this.filteredHistory =
          [...this.history];

        this.updatePagination();

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.loader = false;

        console.error(err);

      }

    });

  }
  // =====================================================
  // SEARCH
  // =====================================================

  search(): void {

    const keyword = this.searchText
      .trim()
      .toLowerCase();

    this.filteredHistory = this.history.filter((item) => {

      const date =
        new Date(item.createdAt)
          .toLocaleString()
          .toLowerCase();

      return (
        !keyword ||
        date.includes(keyword)
      );

    });

    this.currentPage = 1;

    this.updatePagination();

  }

  // =====================================================
  // PAGINATION
  // =====================================================

  updatePagination(): void {

    this.totalPages =
      Math.ceil(
        this.filteredHistory.length /
        this.pageSize
      ) || 1;

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    this.pagedHistory =
      this.filteredHistory.slice(
        start,
        start + this.pageSize
      );

  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePagination();

    }

  }

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }

  pageSizeChanged(): void {

    this.currentPage = 1;

    this.updatePagination();

  }

  get startRecord(): number {

    if (!this.filteredHistory.length) {

      return 0;

    }

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

      this.filteredHistory.length

    );

  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/audiogram'
    ]);

  }

  viewHistory(item: AudiogramHistory): void {

    this.router.navigate([
      '/audiogram/edit',
      item.id
    ], {
      queryParams: {
        mode: 'view'
      }
    });

  }

}