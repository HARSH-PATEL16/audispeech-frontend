import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // =====================================================
  // DEFAULT ROUTE
  // =====================================================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // =====================================================
  // PROTECTED APPLICATION ROUTES
  // =====================================================
  {
    path: '',

    loadComponent: () =>
      import('./layout')
        .then(m => m.DefaultLayoutComponent),

    // Protect all child routes
    canActivateChild: [AuthGuard],

    data: {
      title: 'Home'
    },

    children: [

      // =================================================
      // DASHBOARD
      // =================================================
      {
        path: 'dashboard',

        loadChildren: () =>
          import('./views/dashboard/routes')
            .then(m => m.routes)
      },

      // =================================================
      // COMPANY
      // =================================================
      {
        path: 'company',

        loadComponent: () =>
          import('./views/pages/company/company-list/company-list')
            .then(m => m.CompanyListComponent),

        data: {
          title: 'Company List'
        }
      },

      {
        path: 'company/add',

        loadComponent: () =>
          import('./views/pages/company/add-company/add-company')
            .then(m => m.AddCompanyComponent),

        data: {
          title: 'Add Company'
        }
      },

      {
        path: 'company/edit/:id',

        loadComponent: () =>
          import('./views/pages/company/edit-company/edit-company')
            .then(m => m.EditCompanyComponent),

        data: {
          title: 'Edit Company'
        }
      },

      // =================================================
      // USER
      // =================================================
      {
        path: 'user',

        loadComponent: () =>
          import('./views/pages/user/user-list/user-list')
            .then(m => m.UserListComponent),

        data: {
          title: 'User List'
        }
      },

      {
        path: 'user/add',

        loadComponent: () =>
          import('./views/pages/user/add-user/add-user')
            .then(m => m.AddUserComponent),

        data: {
          title: 'Add User'
        }
      },

      {
        path: 'user/edit/:id',

        loadComponent: () =>
          import('./views/pages/user/edit-user/edit-user')
            .then(m => m.EditUserComponent),

        data: {
          title: 'Edit User'
        }
      },

      // =================================================
      // AUDIOGRAM
      // =================================================
      {
        path: 'audiogram',

        loadComponent: () =>
          import('./views/pages/audiogram/audiogram-list/audiogram-list')
            .then(m => m.AudiogramListComponent),

        data: {
          title: 'Audiogram List'
        }
      },

      {
        path: 'audiogram/add',

        loadComponent: () =>
          import('./views/pages/audiogram/create-audiogram/create-audiogram')
            .then(m => m.CreateAudiogramComponent),

        data: {
          title: 'Add Audiogram'
        }
      },

      {
        path: 'audiogram/edit/:id',

        loadComponent: () =>
          import('./views/pages/audiogram/edit-audiogram/edit-audiogram')
            .then(m => m.EditAudiogramComponent),

        data: {
          title: 'Edit Audiogram'
        }
      },

      {
        path: 'audiogram/history/:id',

        loadComponent: () =>
          import('./views/pages/audiogram/audiogram-history/audiogram-history')
            .then(m => m.AudiogramHistoryComponent),

        data: {
          title: 'Audiogram History'
        }
      },

      // =================================================
      // PATIENT
      // =================================================
      {
        path: 'patient/list',

        loadComponent: () =>
          import('./views/pages/patients/patient-list/patient-list')
            .then(m => m.PatientListComponent),

        data: {
          title: 'Patient Lists'
        }
      },

      {
        path: 'patient/add',

        loadComponent: () =>
          import('./views/pages/patients/add-patient/add-patient')
            .then(m => m.AddPatientComponent),

        data: {
          title: 'Add Patient'
        }
      },

      {
        path: 'patient/edit/:id',

        loadComponent: () =>
          import('./views/pages/patients/edit-patient/edit-patient')
            .then(m => m.EditPatientComponent),

        data: {
          title: 'Edit Patient'
        }
      },

      // =================================================
      // DOCTOR
      // =================================================
      {
        path: 'doctor/list',

        loadComponent: () =>
          import('./views/pages/doctor/doctor-list/doctor-list')
            .then(m => m.DoctorListComponent),

        data: {
          title: 'Doctor Lists'
        }
      },

      {
        path: 'doctor/add',

        loadComponent: () =>
          import('./views/pages/doctor/add-doctor/add-doctor')
            .then(m => m.AddDoctorComponent),

        data: {
          title: 'Add Doctor'
        }
      },

      {
        path: 'doctor/edit/:id',

        loadComponent: () =>
          import('./views/pages/doctor/edit-doctor/edit-doctor')
            .then(m => m.EditDoctorComponent),

        data: {
          title: 'Edit Doctor'
        }
      },

      // =================================================
      // AUDIOGRAM REPORT
      // =================================================
      {
        path: 'report/audiogram',

        loadComponent: () =>
          import('./views/pages/reports/audiogram/report-list/report-list')
            .then(m => m.ReportListComponent),

        data: {
          title: 'Audiogram Report'
        }
      },

      {
        path: 'report/audiogram/report-view/:id',

        loadComponent: () =>
          import('./views/pages/reports/audiogram/report-view/report-view')
            .then(m => m.ReportViewComponent),

        data: {
          title: 'Audiogram Report Preview'
        }
      },

      // =================================================
      // DATABASE BACKUP
      // =================================================
      {
        path: 'backup',

        loadComponent: () =>
          import('./views/pages/backup/database-backup/database-backup')
            .then(m => m.DatabaseBackupComponent),

        data: {
          title: 'Database Backup'
        }
      }
    ]
  },

  // =====================================================
  // PUBLIC ROUTES
  // =====================================================

  // 404
  {
    path: '404',

    loadComponent: () =>
      import('./views/pages/page404/page404.component')
        .then(m => m.Page404Component),

    data: {
      title: 'Page 404'
    }
  },

  // 500
  {
    path: '500',

    loadComponent: () =>
      import('./views/pages/page500/page500.component')
        .then(m => m.Page500Component),

    data: {
      title: 'Page 500'
    }
  },

  // LOGIN
  {
    path: 'login',

    loadComponent: () =>
      import('./views/pages/login/login.component')
        .then(m => m.LoginComponent),

    data: {
      title: 'Login Page'
    }
  },

  // REGISTER
  {
    path: 'register',

    loadComponent: () =>
      import('./views/pages/register/register.component')
        .then(m => m.RegisterComponent),

    data: {
      title: 'Register Page'
    }
  },

  // =====================================================
  // UNKNOWN URL
  // =====================================================
  {
    path: '**',
    redirectTo: '404'
  }
];