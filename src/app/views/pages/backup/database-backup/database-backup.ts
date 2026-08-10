import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  CardBodyComponent,
  CardComponent,
  ButtonDirective
} from '@coreui/angular';

import {
  Router
} from '@angular/router';

import {
  ToastrService
} from 'ngx-toastr';

import {
  ApiService
} from '../../../../services/api-service/api.service';

import {
  LoaderComponent
} from '../../../../views/pages/loader/loader';


@Component({
  selector: 'app-database-backup',

  standalone: true,

  templateUrl: './database-backup.html',

  styleUrls: ['./database-backup.scss'],

  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    LoaderComponent
  ]
})


export class DatabaseBackupComponent {


  /* =====================================================
     LOADER
  ===================================================== */

  loader = false;


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(

    private apiService: ApiService,

    private toastr: ToastrService,

    private cdr: ChangeDetectorRef,

    private router: Router

  ) { }


  /* =====================================================
     TAKE DATABASE BACKUP
  ===================================================== */

  takeBackup(): void {

    // Prevent multiple requests

    if (this.loader) {

      return;

    }


    // Start loader

    this.loader = true;


    this.apiService

      .post(
        '/database/backup',
        {},
        true
      )

      .subscribe({

        /* =====================================================
           SUCCESS
        ===================================================== */

        next: (response: any) => {

          this.loader = false;


          if (response?.success === 1) {

            this.toastr.success(

              response?.message ||

              'Database backup created successfully.'

            );


            this.cdr.detectChanges();

          }

          else {

            this.toastr.error(

              response?.message ||

              'Unable to create database backup.'

            );

          }

        },


        /* =====================================================
           ERROR
        ===================================================== */

        error: (error: any) => {

          this.loader = false;


          console.error(
            'Database backup error:',
            error
          );


          this.toastr.error(

            error?.error?.message ||

            'Unable to create database backup.'

          );


          this.cdr.detectChanges();

        }

      });

  }


  /* =====================================================
     BACK TO DASHBOARD
  ===================================================== */

  backToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}