import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../../services/api-service/api.service';
import { ToastrService } from 'ngx-toastr';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';


interface Patient {

  id: string;

  name: string;

  mobile_no: string;

  gender: number;

  dob: string;

  age: number;

  blood_group: string | null;

  email: string;

  country_id: number;

  state_id: number;

  city_id: number;

  pincode: number;

  address: string;

  visit_date: string;

  reference_doctor: string;

  purpose_of_visit: string;

  chief_complaint: string | null;

  remarks: string;

  status: boolean;

  is_deleted: boolean;

  createdAt: string;

  updatedAt: string;

  doctor: any;

}


@Component({

  selector: 'app-patient-list',

  standalone: true,

  templateUrl: './patient-list.html',

  styleUrls: ['./patient-list.scss'],

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


export class PatientListComponent implements OnInit {


  searchText = '';

  selectedGender = '';

  selectedStatus = '';

  fromDate = '';

  toDate = '';

  loader = false;



  genders = [

    'Male',

    'Female',

    'Other'

  ];



  statuses = [

    'Active',

    'Inactive'

  ];



  patients: Patient[] = [];

  filteredPatients: Patient[] = [];

  pagedPatients: Patient[] = [];



  pageSize = 10;

  currentPage = 1;

  totalPages = 1;



  sortColumn: keyof Patient = 'visit_date';

  sortDirection: 'asc' | 'desc' = 'desc';



  constructor(

    private router: Router,

    private apiService: ApiService,

    private toastr: ToastrService,

    private cdr: ChangeDetectorRef

  ) { }



  ngOnInit(): void {

    this.loadPatients();

  }



  loadPatients(): void {

    this.loader = true;


    this.apiService.get('/patient/lists', true)

      .subscribe({

        next: (response: any) => {

          this.loader = false;


          this.patients = response?.data || [];
          console.log('this.patients: ', this.patients);

          this.filteredPatients = [

            ...this.patients

          ];


          this.currentPage = 1;


          this.updatePagination();


          this.cdr.detectChanges();


        },


        error: (err) => {

          this.loader = false;

          console.error(

            'Error loading patients',

            err

          );


          this.toastr.error(

            'Unable to load patients'

          );


        }


      });


  }



  search(): void {


    const search = this.searchText

      .trim()

      .toLowerCase();



    this.filteredPatients = this.patients.filter(patient => {



      const gender = this.getGender(

        patient.gender

      );



      const status = this.getStatus(

        patient.status

      );



      const visitDate = patient.visit_date

        ? patient.visit_date.substring(0, 10)

        : '';



      const matchesSearch =


        !search ||


        patient.name

          .toLowerCase()

          .includes(search) ||


        patient.mobile_no

          .includes(search) ||


        patient.email

          ?.toLowerCase()

          .includes(search);



      const matchesGender =


        !this.selectedGender ||


        gender === this.selectedGender;



      const matchesStatus =


        !this.selectedStatus ||


        status === this.selectedStatus;



      const matchesFromDate =


        !this.fromDate ||


        visitDate >= this.fromDate;



      const matchesToDate =


        !this.toDate ||


        visitDate <= this.toDate;



      return (

        matchesSearch &&

        matchesGender &&

        matchesStatus &&

        matchesFromDate &&

        matchesToDate

      );


    });



    this.currentPage = 1;


    this.updatePagination();


  }



  resetFilters(): void {


    this.searchText = '';

    this.selectedGender = '';

    this.selectedStatus = '';

    this.fromDate = '';

    this.toDate = '';



    this.filteredPatients = [

      ...this.patients

    ];



    this.currentPage = 1;


    this.updatePagination();


  }

  sort(column: keyof Patient): void {


    if (this.sortColumn === column) {


      this.sortDirection =

        this.sortDirection === 'asc'

          ? 'desc'

          : 'asc';


    } else {


      this.sortColumn = column;


      this.sortDirection = 'asc';


    }



    this.filteredPatients.sort((a: any, b: any) => {


      let valueA = a[column];

      let valueB = b[column];



      if (typeof valueA === 'string') {

        valueA = valueA.toLowerCase();

      }



      if (typeof valueB === 'string') {

        valueB = valueB.toLowerCase();

      }



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





  updatePagination(): void {



    this.totalPages =

      Math.ceil(

        this.filteredPatients.length /

        this.pageSize

      ) || 1;




    const start =

      (this.currentPage - 1) *

      this.pageSize;




    this.pagedPatients =

      this.filteredPatients.slice(

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


    if (

      !this.filteredPatients.length

    ) {


      return 0;


    }



    return (

      (this.currentPage - 1) *

      this.pageSize

      +

      1

    );


  }





  get endRecord(): number {


    return Math.min(

      this.currentPage *

      this.pageSize,

      this.filteredPatients.length

    );


  }





  getGender(gender: number): string {


    switch (gender) {


      case 0:

        return 'Male';



      case 1:

        return 'Female';



      default:

        return 'Other';


    }


  }





  getStatus(status: boolean): string {


    return status

      ? 'Active'

      : 'Inactive';


  }





  addPatient(): void {


    this.router.navigate([

      '/patient/add'

    ]);


  }





  editPatient(id: string): void {


    this.router.navigate([

      '/patient/edit',

      id

    ]);


  }


}