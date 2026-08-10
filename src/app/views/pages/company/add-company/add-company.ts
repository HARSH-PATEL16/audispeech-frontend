import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

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


@Component({

  selector: 'app-add-company',

  standalone: true,

  templateUrl: './add-company.html',

  styleUrls: ['./add-company.scss'],

  imports: [

    CommonModule,

    ReactiveFormsModule,

    ContainerComponent,

    RowComponent,

    ColComponent,

    CardComponent,

    CardBodyComponent,

    ButtonDirective,

    LoaderComponent

  ]

})


export class AddCompanyComponent implements OnInit {


  companyForm!: FormGroup;


  logoPreview: string | ArrayBuffer | null = null;


  logoFile: File | null = null;


  states: any[] = [];

  loader = false;


  cities: any[] = [];


  isLoading: boolean = false;



  constructor(

    private fb: FormBuilder,

    private router: Router,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef,

    private toastr: ToastrService

  ) {



    this.companyForm = this.fb.group({


      companyName: [

        '',

        Validators.required

      ],


      tagLine: [

        ''

      ],


      contactNumber: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[0-9]{10}$/)

        ]

      ],



      alternateContactNumber: [

        '',

        Validators.pattern(/^[0-9]{10}$/)

      ],



      email: [

        '',

        [

          Validators.required,

          Validators.email

        ]

      ],



      website: [

        ''

      ],



      address: [

        '',

        Validators.required

      ],



      country: [

        'India',

        Validators.required

      ],



      state: [

        '',

        Validators.required

      ],



      city: [

        '',

        Validators.required

      ],



      pincode: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[0-9]{6}$/)

        ]

      ]

    });


  }





  ngOnInit(): void {


    this.loadStates();


  }







  loadStates(): void {

    this.loader = true;


    this.apiService
      .get(
        '/state/lists',
        true
      )

      .subscribe({


        next: (response: any) => {

          this.loader = true;


          this.states =
            response.data || [];


          this.cdr.detectChanges();


        },


        error: (err) => {

          this.loader = false


          console.error(
            err
          );


        }


      });


  }







  onStateChange(): void {


    const stateId =
      this.companyForm.value.state;



    this.companyForm.patchValue({

      city: ''

    });



    this.loadCities(
      stateId
    );


  }







  loadCities(stateId: any): void {


    this.apiService
      .get(
        `/cities/byState?stateId=${stateId}`,
        true
      )

      .subscribe({


        next: (response: any) => {


          this.cities =
            response.data || [];


          this.cdr.detectChanges();


        },


        error: (err) => {


          console.error(
            err
          );


        }


      });


  }







  /*=========================================================
  LOGO FILE VALIDATION
=========================================================*/

  onLogoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    /*=====================================================
      ALLOWED EXTENSIONS
    =====================================================*/

    const allowedExtensions = [

      '.png',

      '.jpg',

      '.jpeg',

      '.webp'

    ];


    /*=====================================================
      ALLOWED MIME TYPES
    =====================================================*/

    const allowedMimeTypes = [

      'image/png',

      'image/jpeg',

      'image/jpg',

      'image/webp'

    ];


    /*=====================================================
      FILE EXTENSION
    =====================================================*/

    const fileName =
      file.name.toLowerCase();


    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );


    /*=====================================================
      VALIDATE EXTENSION
    =====================================================*/

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {

      this.toastr.error(
        'Only PNG, JPG, JPEG and WEBP images are allowed.'
      );


      input.value = '';

      return;

    }


    /*=====================================================
      VALIDATE MIME TYPE
    =====================================================*/

    if (
      !allowedMimeTypes.includes(
        file.type
      )
    ) {

      this.toastr.error(
        'Invalid image file type.'
      );


      input.value = '';

      return;

    }


    /*=====================================================
      MAXIMUM FILE SIZE - 5 MB
    =====================================================*/

    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      this.toastr.error(
        'Logo size must not exceed 5 MB.'
      );


      input.value = '';

      return;

    }


    /*=====================================================
      VALID FILE
    =====================================================*/

    this.logoFile =
      file;


    /*=====================================================
      CREATE PREVIEW
    =====================================================*/

    const reader =
      new FileReader();


    reader.onload = () => {

      this.logoPreview =
        reader.result;

      this.cdr.detectChanges();

    };


    reader.onerror = () => {

      this.logoFile = null;

      this.logoPreview = null;

      this.toastr.error(
        'Unable to preview the selected image.'
      );

    };


    reader.readAsDataURL(file);

  }







  /*=========================================================
  REMOVE LOGO
=========================================================*/

  removeLogo(): void {

    this.logoFile = null;

    this.logoPreview = null;

  }








  saveCompany(): void {


    if (
      this.companyForm.invalid
    ) {

      this.companyForm.markAllAsTouched();

      return;

    }



    this.isLoading = true;



    const formData =
      new FormData();





    Object.keys(
      this.companyForm.value
    )

      .forEach(key => {


        formData.append(

          key,

          this.companyForm.value[key]

        );


      });







    if (this.logoFile) {


      formData.append(

        "logo",

        this.logoFile

      );


    }






    this.apiService

      .post(

        "/company/add",

        formData,

        true

      )

      .subscribe({



        next: (response: any) => {


          // console.log(
          //   response
          // );



          this.isLoading = false;



          this.router.navigate([

            "/company"

          ]);



        },




        error: (err) => {


          console.error(
            err
          );



          this.isLoading = false;



        }



      });



  }







  cancel(): void {


    this.router.navigate([

      '/company'

    ]);


  }







  back(): void {


    this.router.navigate([

      '/company'

    ]);


  }



}