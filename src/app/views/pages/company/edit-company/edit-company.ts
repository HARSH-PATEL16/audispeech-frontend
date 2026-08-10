import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

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

  selector: 'app-edit-company',

  standalone: true,

  templateUrl: './edit-company.html',

  styleUrls: ['./edit-company.scss'],

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


export class EditCompanyComponent implements OnInit {


  // =====================================================
  // CONSTANTS
  // =====================================================

  readonly MAX_LOGO_SIZE =
    5 * 1024 * 1024; // 5 MB


  readonly ALLOWED_LOGO_TYPES = [

    'image/png',

    'image/jpeg',

    'image/jpg'

  ];


  readonly ALLOWED_LOGO_EXTENSIONS = [

    'png',

    'jpg',

    'jpeg'

  ];


  // =====================================================
  // VARIABLES
  // =====================================================

  loader = false;

  companyId = '';

  companyForm!: FormGroup;


  logoPreview: string | null = null;

  logoFile: File | null = null;


  states: any[] = [];

  cities: any[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private fb: FormBuilder,

    private router: Router,

    private route: ActivatedRoute,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef,

    private toastr: ToastrService

  ) {


    this.createForm();

  }


  // =====================================================
  // CREATE FORM
  // =====================================================

  createForm(): void {

    this.companyForm = this.fb.group({

      companyName: [

        '',

        [

          Validators.required,

          Validators.minLength(2),

          Validators.maxLength(150)

        ]

      ],


      tagLine: [

        '',

        [

          Validators.maxLength(250)

        ]

      ],


      contactNumber: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[6-9][0-9]{9}$/)

        ]

      ],


      alternateContactNumber: [

        '',

        [

          Validators.pattern(/^[6-9][0-9]{9}$/)

        ]

      ],


      email: [

        '',

        [

          Validators.required,

          Validators.email,

          Validators.maxLength(150)

        ]

      ],


      website: [

        '',

        [

          Validators.maxLength(250)

        ]

      ],


      address: [

        '',

        [

          Validators.required,

          Validators.minLength(5),

          Validators.maxLength(500)

        ]

      ],


      country: [

        'India',

        [

          Validators.required

        ]

      ],


      state: [

        '',

        [

          Validators.required

        ]

      ],


      city: [

        '',

        [

          Validators.required

        ]

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


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.companyId =
      this.route.snapshot.paramMap.get('id') || '';


    if (!this.companyId) {

      this.toastr.error(
        'Company ID is missing'
      );

      this.back();

      return;

    }


    this.loadStates();

    this.loadCompany();

  }


  // =====================================================
  // LOAD STATES
  // =====================================================

  loadStates(): void {

    this.apiService

      .get(
        '/state/lists',
        true
      )

      .subscribe({

        next: (res: any) => {

          this.states =
            res.data || [];


          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error(
            'State loading error:',
            err
          );

          this.toastr.error(
            'Unable to load states'
          );

        }

      });

  }


  // =====================================================
  // LOAD CITIES
  // =====================================================

  loadCities(stateId: any): void {

    if (!stateId) {

      this.cities = [];

      return;

    }


    this.apiService

      .get(
        `/cities/byState?stateId=${stateId}`,
        true
      )

      .subscribe({

        next: (res: any) => {

          this.cities =
            res.data || [];


          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error(
            'City loading error:',
            err
          );

          this.toastr.error(
            'Unable to load cities'
          );

        }

      });

  }


  // =====================================================
  // STATE CHANGE
  // =====================================================

  onStateChange(): void {

    const stateId =
      this.companyForm.get('state')?.value;


    this.companyForm.patchValue({

      city: ''

    });


    this.cities = [];


    if (stateId) {

      this.loadCities(stateId);

    }

  }


  // =====================================================
  // LOAD COMPANY
  // =====================================================

  loadCompany(): void {

    this.loader = true;


    this.apiService

      .get(
        `/company/details?id=${this.companyId}`,
        true
      )

      .subscribe({

        next: (res: any) => {

          this.loader = false;


          if (res?.success !== 1) {

            this.toastr.error(
              res?.message ||
              'Unable to load company details'
            );

            this.back();

            return;

          }


          const company =
            res.data;


          this.companyForm.patchValue({

            companyName:
              company.name || '',


            tagLine:
              company.slogan || '',


            contactNumber:
              company.contact_number || '',


            alternateContactNumber:
              company.alternate_contact_number || '',


            email:
              company.email || '',


            website:
              company.website || '',


            address:
              company.address || '',


            country:
              'India',


            state:
              company.state_id || '',


            city:
              company.city_id || '',


            pincode:
              company.pincode || ''

          });


          // Load cities for existing state

          if (company.state_id) {

            this.loadCities(
              company.state_id
            );

          }


          // Existing logo

          if (company.logo) {

            this.logoPreview =
              company.logo;

          }


          this.cdr.detectChanges();

        },


        error: (err) => {

          this.loader = false;


          console.error(
            'Company load error:',
            err
          );


          this.toastr.error(
            'Unable to load company details'
          );

        }

      });

  }


  // =====================================================
  // LOGO SELECT
  // =====================================================

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


    // ===================================================
    // FILE EXTENSION
    // ===================================================

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();


    if (
      !extension ||
      !this.ALLOWED_LOGO_EXTENSIONS.includes(
        extension
      )
    ) {

      this.toastr.error(
        'Only PNG, JPG and JPEG files are allowed'
      );

      input.value = '';

      return;

    }


    // ===================================================
    // MIME TYPE
    // ===================================================

    if (
      !this.ALLOWED_LOGO_TYPES.includes(
        file.type
      )
    ) {

      this.toastr.error(
        'Only PNG, JPG and JPEG files are allowed'
      );

      input.value = '';

      return;

    }


    // ===================================================
    // FILE SIZE - 5 MB
    // ===================================================

    if (
      file.size >
      this.MAX_LOGO_SIZE
    ) {

      this.toastr.error(
        'Logo size must be less than 5 MB'
      );

      input.value = '';

      return;

    }


    // ===================================================
    // STORE FILE
    // ===================================================

    this.logoFile =
      file;


    // ===================================================
    // PREVIEW
    // ===================================================

    const reader =
      new FileReader();


    reader.onload = () => {

      this.logoPreview =
        reader.result as string;


      this.cdr.detectChanges();

    };


    reader.readAsDataURL(file);

  }


  // =====================================================
  // REMOVE LOGO
  // =====================================================

  removeLogo(): void {

    this.logoFile = null;

    this.logoPreview = null;

  }


  // =====================================================
  // UPDATE COMPANY
  // =====================================================

  updateCompany(): void {


    // ===================================================
    // VALIDATE FORM
    // ===================================================

    if (
      this.companyForm.invalid
    ) {

      this.companyForm.markAllAsTouched();


      console.log(
        'Company Form is Invalid'
      );


      Object.keys(
        this.companyForm.controls
      ).forEach(key => {

        const control =
          this.companyForm.get(key);


        if (
          control?.invalid
        ) {

          console.log(

            'Invalid Field:',

            key,

            'Value:',

            control.value,

            'Errors:',

            control.errors

          );

        }

      });


      return;

    }


    // ===================================================
    // START LOADER
    // ===================================================

    this.loader = true;


    // ===================================================
    // FORM DATA
    // ===================================================

    const formData =
      new FormData();


    formData.append(
      'id',
      this.companyId
    );


    formData.append(
      'companyName',
      this.companyForm.value.companyName.trim()
    );


    formData.append(
      'tagLine',
      this.companyForm.value.tagLine?.trim() || ''
    );


    formData.append(
      'contactNumber',
      this.companyForm.value.contactNumber
    );


    formData.append(
      'alternateContactNumber',
      this.companyForm.value
        .alternateContactNumber || ''
    );


    formData.append(
      'email',
      this.companyForm.value.email
        .trim()
        .toLowerCase()
    );


    formData.append(
      'website',
      this.companyForm.value.website?.trim() || ''
    );


    formData.append(
      'address',
      this.companyForm.value.address.trim()
    );


    formData.append(
      'country',
      this.companyForm.value.country || 'India'
    );


    formData.append(
      'state',
      this.companyForm.value.state
    );


    formData.append(
      'city',
      this.companyForm.value.city
    );


    formData.append(
      'pincode',
      this.companyForm.value.pincode
    );


    // ===================================================
    // NEW LOGO
    // ===================================================

    /*
      If user selected a new logo,
      send it to backend.

      If no new logo is selected,
      backend should keep the existing logo.
    */

    if (this.logoFile) {

      formData.append(
        'logo',
        this.logoFile,
        this.logoFile.name
      );

    }


    // ===================================================
    // API
    // ===================================================

    this.apiService

      .put(
        '/company/edit',
        formData,
        true
      )

      .subscribe({

        next: (response: any) => {

          this.loader = false;


          if (
            response?.success === 1
          ) {

            this.toastr.success(
              response?.message ||
              'Company updated successfully'
            );


            this.router.navigate([
              '/company'
            ]);

          }
          else {

            this.toastr.error(
              response?.message ||
              'Unable to update company'
            );

          }

        },


        error: (err) => {

          this.loader = false;


          console.error(
            'Company update error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            'Something went wrong while updating company'

          );

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/company'
    ]);

  }


  // =====================================================
  // BACK
  // =====================================================

  back(): void {

    this.router.navigate([
      '/company'
    ]);

  }

}