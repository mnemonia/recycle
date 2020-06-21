import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyJobsPage } from './my-jobs.page';

describe('MyJobsPage', () => {
  let component: MyJobsPage;
  let fixture: ComponentFixture<MyJobsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyJobsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyJobsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
