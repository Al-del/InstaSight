import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalFooterComponent } from './vertical-footer.component';

describe('VerticalFooterComponent', () => {
  let component: VerticalFooterComponent;
  let fixture: ComponentFixture<VerticalFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
