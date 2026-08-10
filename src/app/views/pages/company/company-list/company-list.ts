import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../../../services/api-service/api.service';

import { LoaderComponent } from '../../../../views/pages/loader/loader';

import { ToastrService } from 'ngx-toastr';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';


interface Company {

  id: string;

  companyName: string;

  contactNumber: string;

  email: string;

  address: string;

  logo: string;

}


@Component({

  selector: 'app-company-list',

  standalone: true,

  templateUrl: './company-list.html',

  styleUrls: ['./company-list.scss'],

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


export class CompanyListComponent implements OnInit {


  searchText = '';

  loader = false;


  companies: Company[] = [];

  filteredCompanies: Company[] = [];

  pagedCompanies: Company[] = [];



  pageSize = 10;

  currentPage = 1;

  totalPages = 1;



  sortColumn: keyof Company = 'companyName';

  sortDirection: 'asc' | 'desc' = 'asc';



  constructor(

    private router: Router,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef,

    private toastr: ToastrService

  ) { }




  ngOnInit(): void {

    this.loadCompanies();

  }




  //======================================================
  // LOAD COMPANY LIST
  //======================================================

  loadCompanies(): void {

    this.loader = true;

    this.apiService
      .get('/company/lists', true)

      .subscribe({


        next: (response: any) => {

          this.loader = false;


          // console.log(
          //   "Company Response:",
          //   response
          // );



          if (response.success == 1) {


            this.companies =

              (response.data || []).map((item: any) => ({


                id:
                  item.id,


                companyName:
                  item.name,


                contactNumber:
                  item.contact_number,


                email:
                  item.email,


                address:
                  item.address,


                logo:
                  item.logo


              }));



            this.filteredCompanies =
              [...this.companies];



            this.currentPage = 1;


            this.updatePagination();



            this.cdr.detectChanges();



          } else {
            this.toastr.error(response?.message);
          }


        },


        error: (err) => {

          this.loader = false;

          console.error(
            "Company Load Error:",
            err
          );


        }


      });


  }





  //======================================================
  // SEARCH
  //======================================================


  search(): void {


    const value =
      this.searchText
        .trim()
        .toLowerCase();



    this.filteredCompanies =

      this.companies.filter(company =>


        company.companyName
          .toLowerCase()
          .includes(value)


        ||

        company.contactNumber
          .includes(value)


        ||

        company.email
          .toLowerCase()
          .includes(value)


        ||

        company.address
          .toLowerCase()
          .includes(value)


      );



    this.currentPage = 1;


    this.updatePagination();


  }





  //======================================================
  // RESET
  //======================================================


  resetFilters(): void {


    this.searchText = '';


    this.filteredCompanies =
      [...this.companies];


    this.currentPage = 1;


    this.updatePagination();


  }





  //======================================================
  // SORT
  //======================================================


  sort(column: keyof Company): void {


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



    this.filteredCompanies.sort((a, b) => {


      const valueA =
        String(a[column]).toLowerCase();


      const valueB =
        String(b[column]).toLowerCase();



      if (valueA < valueB)

        return this.sortDirection === 'asc'
          ? -1
          : 1;



      if (valueA > valueB)

        return this.sortDirection === 'asc'
          ? 1
          : -1;



      return 0;


    });



    this.updatePagination();


  }






  //======================================================
  // PAGINATION
  //======================================================


  updatePagination(): void {


    this.totalPages =

      Math.ceil(

        this.filteredCompanies.length /
        this.pageSize

      ) || 1;



    const start =

      (this.currentPage - 1)
      *
      this.pageSize;



    this.pagedCompanies =

      this.filteredCompanies.slice(

        start,

        start + this.pageSize

      );


  }





  previousPage(): void {


    if (this.currentPage > 1) {


      this.currentPage--;


      this.updatePagination();


    }


  }





  nextPage(): void {


    if (this.currentPage < this.totalPages) {


      this.currentPage++;


      this.updatePagination();


    }


  }





  pageSizeChanged(): void {


    this.currentPage = 1;


    this.updatePagination();


  }





  get startRecord(): number {


    if (!this.filteredCompanies.length)

      return 0;



    return (

      (this.currentPage - 1)
      *
      this.pageSize

    ) + 1;


  }





  get endRecord(): number {


    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredCompanies.length

    );


  }





  //======================================================
  // NAVIGATION
  //======================================================


  addCompany(): void {


    this.router.navigate([

      '/company/add'

    ]);


  }





  edit(company: Company): void {


    this.router.navigate([

      '/company/edit',

      company.id

    ]);


  }



}