import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  // {
  //   name: 'Dashboard',
  //   url: '/dashboard',
  //   iconComponent: { name: 'cil-speedometer' }
  // },
  {
    name: 'Company',
    url: '/company',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Users',
    url: '/user',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'Doctors',
    url: '/doctor/list',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'Patients',
    url: '/patient/list',
    iconComponent: { name: 'cil-user-follow' }
  },
  {
    name: 'Audiogram',
    url: '/audiogram',
    iconComponent: { name: 'cil-chart' }
  },
  {
    name: 'Report',
    url: '/report/audiogram',
    iconComponent: { name: 'cil-file' }
  }
];
