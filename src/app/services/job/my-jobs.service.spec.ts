import { TestBed } from '@angular/core/testing';

import { MyJobsService } from './my-jobs.service';

describe('MyJobsService', () => {
  let service: MyJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
