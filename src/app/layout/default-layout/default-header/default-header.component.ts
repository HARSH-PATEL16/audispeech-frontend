import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  cilStorage,
  cilSave,
  cilCloud,
  cilCloudDownload
} from '@coreui/icons';


export const icons = {
  cilStorage,
  cilSave,
  cilCloud,
  cilCloudDownload
};

import {
  AvatarComponent,
  BreadcrumbRouterComponent,
  ContainerComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { ToastrService } from 'ngx-toastr';
import { LocalService } from '../../../services/storage/local.service';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [
    ContainerComponent,
    HeaderNavComponent,
    NgTemplateOutlet,
    DropdownComponent,
    DropdownToggleDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownItemDirective,
    IconDirective
  ]
})
export class DefaultHeaderComponent extends HeaderComponent {

  sidebarId = input('sidebar1');
  localData: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private localStorageService: LocalService
  ) {
    super();
    this.localData = this.localStorageService.getJsonValue(environment.typeDouble)
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();

    this.toastr.success('You have been logged out successfully');
    this.router.navigate(['/login']);
  }

  dbBackup(): void {
    this.router.navigate(['/backup']);
  }
}
