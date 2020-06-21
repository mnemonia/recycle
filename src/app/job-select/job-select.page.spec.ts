import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JobSelectPage } from './job-select.page';

describe('JobSelectPage', () => {
  let component: JobSelectPage;
  let fixture: ComponentFixture<JobSelectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobSelectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
