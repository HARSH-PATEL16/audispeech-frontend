import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../services/api-service/api.service';
import { LoaderComponent } from '../../../../views/pages/loader/loader';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

interface User {
  id: string;
  name: string;
  username: string;
  mobile_no: string;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    RouterModule,
    LoaderComponent
  ]
})
export class UserListComponent implements OnInit {

  searchText = '';

  loader = false;

  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  sortColumn: keyof User = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';


  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.loadUsers();
  }


  search(): void {

    const search = this.searchText.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.mobile_no.includes(search) ||
      user.username.toLowerCase().includes(search)
    );

    this.currentPage = 1;

    this.applySorting();
  }


  resetFilters(): void {

    this.searchText = '';

    this.filteredUsers = [...this.users];

    this.currentPage = 1;

    this.sortColumn = 'createdAt';
    this.sortDirection = 'desc';

    this.applySorting();
  }


  sort(column: keyof User): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';

    }

    this.applySorting();
  }


  private applySorting(): void {

    this.filteredUsers.sort((a, b) => {

      const valueA = a[this.sortColumn] ?? '';
      const valueB = b[this.sortColumn] ?? '';

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;

    });

    this.updatePagination();

  }


  updatePagination(): void {

    this.totalPages =
      Math.ceil(this.filteredUsers.length / this.pageSize) || 1;

    const start =
      (this.currentPage - 1) * this.pageSize;

    this.pagedUsers =
      this.filteredUsers.slice(
        start,
        start + this.pageSize
      );

  }


  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePagination();

    }

  }


  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }



  pageSizeChanged(): void {

    this.currentPage = 1;

    this.updatePagination();

  }


  get startRecord(): number {

    if (!this.filteredUsers.length) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;

  }


  get endRecord(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredUsers.length
    );

  }


  addUser(): void {

    this.router.navigate(['/user/add']);

  }


  edit(user: User): void {

    this.router.navigate([
      '/user/edit',
      user.id
    ]);

  }


  loadUsers(): void {

    this.loader = true;

    this.apiService.get('/user/lists', true)
      .subscribe({

        next: (response: any) => {
          
          this.loader = false;

          this.users = response.data || [];

          this.filteredUsers = [
            ...this.users
          ];

          this.applySorting();

          // Angular 21 change detection fix
          this.cdr.detectChanges();

        },

        error: (err) => {
          this.loader = false;
          console.error(err);
        }

      });

  }

}
