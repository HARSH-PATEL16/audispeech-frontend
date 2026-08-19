import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IconDirective } from '@coreui/icons-angular';

import {
  ButtonDirective
} from '@coreui/angular';


@Component({

  selector: 'app-page404',

  templateUrl: './page404.component.html',

  styleUrl: './page404.component.scss',

  imports: [
    IconDirective,
    ButtonDirective
  ]

})


export class Page404Component {


  currentYear = new Date().getFullYear();


  constructor(
    private router: Router
  ) { }


  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}