import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api-service/api.service';
import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

interface Audiogram {
  id: string;
  patientId: string;
  patientName: string;
  mobileNo: string;
  age: number;
  gender: number;
  visitDate: string;
}

@Component({
  selector: 'app-audiogram-list',
  standalone: true,
  templateUrl: './audiogram-list.html',
  styleUrls: ['./audiogram-list.scss'],
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
export class AudiogramListComponent implements OnInit {

  searchText = '';
  fromDate = '';
  toDate = '';

  audiograms: Audiogram[] = [];
  filteredAudiograms: Audiogram[] = [];
  pagedAudiograms: Audiogram[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  sortColumn: keyof Audiogram = 'visitDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  loader = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAudiograms();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  loadAudiograms(): void {
    this.loader = true;
    this.apiService.get('/audiogram/lists', true).subscribe({
      next: (response: any) => {

        this.loader = false;

        this.audiograms = response?.data || [];

        this.filteredAudiograms = [...this.audiograms];

        this.applySorting();

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

  // =====================================================
  // SORTING
  // =====================================================

  private applySorting(): void {

    this.filteredAudiograms.sort((a, b) => {

      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  sort(column: keyof Audiogram): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.updatePagination();
  }

  // =====================================================
  // FILTER
  // =====================================================

  search(): void {

    this.filteredAudiograms = this.audiograms.filter((item) => {

      const keyword = this.searchText.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.patientName.toLowerCase().includes(keyword) ||
        item.mobileNo.includes(keyword);

      const visitDate = item.visitDate.substring(0, 10);

      const matchesFrom =
        !this.fromDate ||
        visitDate >= this.fromDate;

      const matchesTo =
        !this.toDate ||
        visitDate <= this.toDate;

      return (
        matchesSearch &&
        matchesFrom &&
        matchesTo
      );
    });

    this.applySorting();

    this.currentPage = 1;

    this.updatePagination();
  }

  resetFilters(): void {

    this.searchText = '';
    this.fromDate = '';
    this.toDate = '';

    this.filteredAudiograms = [...this.audiograms];

    this.applySorting();

    this.currentPage = 1;

    this.updatePagination();
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  updatePagination(): void {

    this.totalPages =
      Math.ceil(
        this.filteredAudiograms.length /
        this.pageSize
      ) || 1;

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    this.pagedAudiograms =
      this.filteredAudiograms.slice(
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

    if (!this.filteredAudiograms.length) {
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
      this.filteredAudiograms.length
    );
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  addAudiogram(): void {
    this.router.navigate([
      '/audiogram/add'
    ]);
  }

  editAudiogram(item: Audiogram): void {
    this.router.navigate([
      '/audiogram/edit',
      item.patientId
    ]);
  }

  viewHistory(item: Audiogram): void {

    this.router.navigate([
      '/audiogram/history',
      item.id
    ]);

  }

}