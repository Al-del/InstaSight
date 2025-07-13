import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsSeeLocationComponent } from './friends-see-location.component';

describe('FriendsSeeLocationComponent', () => {
  let component: FriendsSeeLocationComponent;
  let fixture: ComponentFixture<FriendsSeeLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsSeeLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsSeeLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
