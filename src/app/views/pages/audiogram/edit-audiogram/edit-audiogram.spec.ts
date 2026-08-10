import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAudiogramComponent } from './edit-audiogram';

describe('EditAudiogramComponent', () => {
  let component: EditAudiogramComponent;
  let fixture: ComponentFixture<EditAudiogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAudiogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAudiogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
