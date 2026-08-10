import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { IconDirective } from '@coreui/icons-angular';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';

import { ApiService } from '../../../../services/api-service/api.service';

interface Doctor {

  id: string;

  name: string;

  mobile_no: string;

  email: string;

  gender: number;

  qualification: string;

  hospital_name: string;

  specialization: string;

  remarks: string;

  country_id: number;

  state_id: number;

  city_id: number;

  pincode: string;

  address: string;

  status: boolean;

  createdAt: string;

}

@Component({

  selector: 'app-doctor-list',

  standalone: true,

  templateUrl: './doctor-list.html',

  styleUrls: ['./doctor-list.scss'],

  imports: [

    CommonModule,

    FormsModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    TableDirective,

    ButtonDirective,

    LoaderComponent
  ]

})

export class DoctorListComponent implements OnInit {

  searchText = '';

  selectedSpecialization = '';

  specializations: string[] = [];

  doctors: Doctor[] = [];

  filteredDoctors: Doctor[] = [];

  pagedDoctors: Doctor[] = [];

  pageSize = 10;

  currentPage = 1;

  totalPages = 1;

  sortColumn: keyof Doctor = 'name';

  sortDirection: 'asc' | 'desc' = 'asc';

  loader = false;

  constructor(

    private router: Router,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {

    this.loadDoctorList();

  }

  /*=========================================================
    LOAD DOCTOR LIST
  =========================================================*/

  loadDoctorList(): void {

    this.loader = true;

    this.apiService.get('/doctor/lists', true)

      .subscribe({

        next: (response: any) => {

          this.loader = false;

          if (response?.success === 1) {

            this.doctors = response.data || [];

            this.filteredDoctors = [...this.doctors];

            this.specializations = [

              ...new Set(

                this.doctors

                  .map(x => x.specialization)

                  .filter(Boolean)

              )

            ].sort();

            this.applySorting();

            this.cdr.detectChanges();

          }

        },

        error: (err) => {

          this.loader = false;

          console.error('Error loading doctors : ', err);

        }

      });

  }

  /*=========================================================
    SEARCH
  =========================================================*/

  search(): void {

    const search = this.searchText.trim().toLowerCase();

    this.filteredDoctors = this.doctors.filter(doctor => {

      const matchesSearch =

        doctor.name?.toLowerCase().includes(search) ||

        doctor.mobile_no?.includes(search) ||

        doctor.email?.toLowerCase().includes(search);

      const matchesSpecialization =

        !this.selectedSpecialization ||

        doctor.specialization === this.selectedSpecialization;

      return matchesSearch && matchesSpecialization;

    });

    this.currentPage = 1;

    this.applySorting();

  }

  /*=========================================================
  RESET FILTERS
=========================================================*/

  resetFilters(): void {

    this.searchText = '';

    this.selectedSpecialization = '';

    this.filteredDoctors = [

      ...this.doctors

    ];

    this.currentPage = 1;

    this.sortColumn = 'name';

    this.sortDirection = 'asc';

    this.applySorting();

  }


  /*=========================================================
    SORT
  =========================================================*/

  sort(column: keyof Doctor): void {


    if (this.sortColumn === column) {

      this.sortDirection =

        this.sortDirection === 'asc'

          ? 'desc'

          : 'asc';

    }

    else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }


    this.applySorting();

  }


  /*=========================================================
    APPLY SORTING
  =========================================================*/

  private applySorting(): void {


    this.filteredDoctors.sort((a, b) => {


      const valueA =

        String(a[this.sortColumn] ?? '')
          .toLowerCase();


      const valueB =

        String(b[this.sortColumn] ?? '')
          .toLowerCase();



      if (valueA < valueB) {

        return this.sortDirection === 'asc'

          ? -1

          : 1;

      }


      if (valueA > valueB) {

        return this.sortDirection === 'asc'

          ? 1

          : -1;

      }


      return 0;


    });


    this.updatePagination();


  }



  /*=========================================================
    PAGINATION
  =========================================================*/

  updatePagination(): void {


    this.totalPages =

      Math.ceil(

        this.filteredDoctors.length /

        this.pageSize

      ) || 1;



    if (this.currentPage > this.totalPages) {

      this.currentPage = this.totalPages;

    }


    const start =

      (this.currentPage - 1) *

      this.pageSize;



    this.pagedDoctors =

      this.filteredDoctors.slice(

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



  /*=========================================================
    RECORD COUNT
  =========================================================*/

  get startRecord(): number {


    if (!this.filteredDoctors.length) {

      return 0;

    }


    return (

      (this.currentPage - 1) *

      this.pageSize

    ) + 1;


  }



  get endRecord(): number {


    return Math.min(

      this.currentPage *

      this.pageSize,

      this.filteredDoctors.length

    );


  }



  /*=========================================================
    NAVIGATION
  =========================================================*/


  addDoctor(): void {


    this.router.navigate([

      '/doctor/add'

    ]);


  }



  editDoctor(id: string): void {


    this.router.navigate([

      '/doctor/edit',

      id

    ]);


  }



  viewDoctor(id: string): void {


    this.router.navigate([

      '/doctor/view',

      id

    ]);


  }


}