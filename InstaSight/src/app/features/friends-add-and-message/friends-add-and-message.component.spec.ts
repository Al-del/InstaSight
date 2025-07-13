import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsAddAndMessageComponent } from './friends-add-and-message.component';

describe('FriendsAddAndMessageComponent', () => {
  let component: FriendsAddAndMessageComponent;
  let fixture: ComponentFixture<FriendsAddAndMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsAddAndMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsAddAndMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
