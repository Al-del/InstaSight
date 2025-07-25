import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstaBrainComponent } from './insta-brain.component';

describe('InstaBrainComponent', () => {
  let component: InstaBrainComponent;
  let fixture: ComponentFixture<InstaBrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstaBrainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstaBrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
