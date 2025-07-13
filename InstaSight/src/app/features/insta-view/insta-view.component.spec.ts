import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstaViewComponent } from './insta-view.component';

describe('InstaViewComponent', () => {
  let component: InstaViewComponent;
  let fixture: ComponentFixture<InstaViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstaViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
