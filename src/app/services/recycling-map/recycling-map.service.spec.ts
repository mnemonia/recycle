import { TestBed } from '@angular/core/testing';

import { RecyclingMapService } from './recycling-map.service';

describe('RecyclingMapService', () => {
  let service: RecyclingMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecyclingMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
