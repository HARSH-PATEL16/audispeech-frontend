import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramHistoryComponent } from './audiogram-history';

describe('AudiogramHistoryComponent', () => {
  let component: AudiogramHistoryComponent;
  let fixture: ComponentFixture<AudiogramHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiogramHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiogramHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
