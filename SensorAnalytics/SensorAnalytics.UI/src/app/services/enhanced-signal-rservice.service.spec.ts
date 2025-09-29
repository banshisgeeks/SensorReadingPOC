import { TestBed } from '@angular/core/testing';

import { EnhancedSignalRServiceService } from './enhanced-signal-rservice.service';

describe('EnhancedSignalRServiceService', () => {
  let service: EnhancedSignalRServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnhancedSignalRServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
