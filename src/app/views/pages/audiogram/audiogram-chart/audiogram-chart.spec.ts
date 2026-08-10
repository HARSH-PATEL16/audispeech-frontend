import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramChartComponent } from './audiogram-chart';

describe('AudiogramChartComponent', () => {
  let component: AudiogramChartComponent;
  let fixture: ComponentFixture<AudiogramChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiogramChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiogramChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
