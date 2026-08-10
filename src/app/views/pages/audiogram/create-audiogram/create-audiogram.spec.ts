import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAudiogramComponent } from './create-audiogram';

describe('CreateAudiogramComponent', () => {
  let component: CreateAudiogramComponent;
  let fixture: ComponentFixture<CreateAudiogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAudiogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAudiogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
