import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {

  ngOnInit(): void {

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

  }

  ngOnDestroy(): void {

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

  }

}