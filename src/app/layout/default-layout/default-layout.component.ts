import { CommonModule } from '@angular/common';

import {
  Component
} from '@angular/core';

import {
  RouterLink,
  RouterOutlet
} from '@angular/router';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarComponent
} from '@coreui/angular';

import {
  DefaultFooterComponent,
  DefaultHeaderComponent
} from './';

import {
  CustomSidebarComponent
} from './custom-sidebar/custom-sidebar';


@Component({
  selector: 'app-dashboard',

  templateUrl: './default-layout.component.html',

  styleUrls: ['./default-layout.component.scss'],

  standalone: true,

  imports: [

    /* =====================================================
       ANGULAR
    ===================================================== */

    CommonModule,

    RouterOutlet,


    /* =====================================================
       COREUI
    ===================================================== */

    ContainerComponent,

    SidebarComponent,

    ShadowOnScrollDirective,


    /* =====================================================
       HEADER / FOOTER
    ===================================================== */

    DefaultHeaderComponent,

    DefaultFooterComponent,


    /* =====================================================
       CUSTOM SIDEBAR
    ===================================================== */

    CustomSidebarComponent

  ]
})


export class DefaultLayoutComponent {


  /* =====================================================
     SIDEBAR STATE
  ===================================================== */

  sidebarVisible = true;


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor() { }


  /* =====================================================
     TOGGLE SIDEBAR
  ===================================================== */

  toggleSidebar(): void {

    this.sidebarVisible = !this.sidebarVisible;

  }


  /* =====================================================
     OPEN SIDEBAR
  ===================================================== */

  openSidebar(): void {

    this.sidebarVisible = true;

  }


  /* =====================================================
     CLOSE SIDEBAR
  ===================================================== */

  closeSidebar(): void {

    this.sidebarVisible = false;

  }

}