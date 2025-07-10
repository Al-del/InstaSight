import { TestBed } from '@angular/core/testing';

import { GetUserLocationService } from './get-user-location.service';

describe('GetUserLocationService', () => {
  let service: GetUserLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetUserLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
