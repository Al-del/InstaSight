import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingFooterComponent } from './floating-footer.component';

describe('FloatingFooterComponent', () => {
  let component: FloatingFooterComponent;
  let fixture: ComponentFixture<FloatingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
