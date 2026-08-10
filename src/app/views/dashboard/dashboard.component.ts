import { Component } from '@angular/core';
import { CardBodyComponent, CardComponent, ColComponent, RowComponent } from '@coreui/angular';

@Component({
  templateUrl: 'dashboard.component.html',
  imports: [RowComponent, ColComponent, CardComponent]
})
export class DashboardComponent {
}
