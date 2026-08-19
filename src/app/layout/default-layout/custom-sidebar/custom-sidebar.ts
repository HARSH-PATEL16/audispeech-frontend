import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CommonModule } from '@angular/common';


interface SidebarItem {
  name: string;
  url?: string;
  icon: string;
  children?: SidebarItem[];
  expanded?: boolean;
}


@Component({
  selector: 'app-custom-sidebar',

  standalone: true,

  templateUrl: './custom-sidebar.html',

  styleUrls: ['./custom-sidebar.scss'],

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ]
})


export class CustomSidebarComponent implements OnInit {


  /* =====================================================
     SIDEBAR MENU
  ===================================================== */

  menuItems: SidebarItem[] = [

    {
      name: 'Company',
      url: '/company',
      icon: 'fa-solid fa-building'
    },

    {
      name: 'Users',
      url: '/user',
      icon: 'fa-solid fa-users'
    },

    {
      name: 'Doctors',
      icon: 'fa-solid fa-user-doctor',

      children: [

        {
          name: 'Reference Doctor',
          url: '/doctor/reference',
          icon: 'fa-solid fa-user-plus'
        },

        {
          name: 'Audiologist',
          url: '/doctor/list',
          icon: 'fa-solid fa-user-doctor'
        }

      ]
    },

    {
      name: 'Patients',
      url: '/patient/list',
      icon: 'fa-solid fa-user'
    },

    {
      name: 'Audiogram',
      url: '/audiogram',
      icon: 'fa-solid fa-chart-column'
    },

    {
      name: 'Reports',
      icon: 'fa-solid fa-file-lines',

      children: [

        {
          name: 'Audiogram',
          url: '/report/audiogram',
          icon: 'fa-solid fa-chart-line'
        }

      ]
    }

  ];


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(
    private router: Router
  ) { }


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.expandActiveMenu();

  }


  /* =====================================================
     TOGGLE MENU
  ===================================================== */

  toggleMenu(item: SidebarItem): void {

    if (!item.children?.length) {
      return;
    }

    item.expanded = !item.expanded;

  }


  /* =====================================================
     EXPAND ACTIVE MENU
  ===================================================== */

  private expandActiveMenu(): void {

    const currentUrl = this.router.url;

    this.menuItems.forEach(item => {

      if (!item.children?.length) {
        return;
      }

      const hasActiveChild = item.children.some(child => {

        return child.url &&
          currentUrl.startsWith(child.url);

      });

      if (hasActiveChild) {

        item.expanded = true;

      }

    });

  }


  /* =====================================================
     CHECK ACTIVE CHILD
  ===================================================== */

  hasActiveChild(item: SidebarItem): boolean {

    if (!item.children?.length) {
      return false;
    }

    const currentUrl = this.router.url;

    return item.children.some(child => {

      return child.url &&
        currentUrl.startsWith(child.url);

    });

  }

}