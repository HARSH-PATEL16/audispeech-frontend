import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiogramListComponent } from './audiogram-list.component';

describe('AudiogramListComponent', () => {
  let component: AudiogramListComponent;
  let fixture: ComponentFixture<AudiogramListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiogramListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiogramListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
