import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSidebar } from './custom-sidebar';

describe('CustomSidebar', () => {
  let component: CustomSidebar;
  let fixture: ComponentFixture<CustomSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
