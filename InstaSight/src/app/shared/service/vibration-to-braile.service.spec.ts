import { TestBed } from '@angular/core/testing';

import { VibrationToBraileService } from './vibration-to-braile.service';

describe('VibrationToBraileService', () => {
  let service: VibrationToBraileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VibrationToBraileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
