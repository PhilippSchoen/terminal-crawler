import { TestBed } from '@angular/core/testing';

import { VirusAgentService } from './virus-agent.service';

describe('VirusAgentService', () => {
  let service: VirusAgentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirusAgentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
