import { HttpParams } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { of as observableOf } from 'rxjs';
import { CPI18nService } from './../../../../../../shared/services/i18n.service';
import { EmployerListComponent } from './employer-list.component';
import { reducers } from '../../../../../../reducers';
import { CPSession } from '../../../../../../session';
import { mockSchool } from '../../../../../../session/mock/school';
import { EmployerModule } from '../employer.module';
import { EmployerService } from '../employer.service';

class MockEmployerService {
  dummy;
  mockEmployers = require('../mockEmployer.json');

  getEmployers(startRage: number, endRage: number, search: any) {
    this.dummy = [startRage, endRage, search];

    return observableOf(this.mockEmployers);
  }
}

describe('EmployersListComponent', () => {
  let spy;
  let search;
  let component: EmployerListComponent;
  let fixture: ComponentFixture<EmployerListComponent>;

  const mockEmployers = require('../mockEmployer.json');
  const employer = {
    id: 1,
    name: 'Hello World!',
    description: 'Test description',
    logo_url: '',
    email: 'test@test.com'
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          EmployerModule,
          RouterTestingModule,
          StoreModule.forRoot({
            HEADER: reducers.HEADER,
            SNACKBAR: reducers.SNACKBAR
          })
        ],
        providers: [
          CPSession,
          CPI18nService,
          { provide: EmployerService, useClass: MockEmployerService }
        ]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(EmployerListComponent);
          component = fixture.componentInstance;
          component.session.g.set('school', mockSchool);

          search = new HttpParams()
            .append('search_str', component.state.search_str)
            .append('sort_field', component.state.sort_field)
            .append('sort_direction', component.state.sort_direction)
            .append('school_id', component.session.g.get('school').id.toString());
        });
    })
  );

  it('onSearch', () => {
    component.onSearch('hello world');
    expect(component.state.search_str).toEqual('hello world');
  });

  it('onCreated', () => {
    component.onCreated(employer);

    expect(component.launchCreateModal).toBeFalsy();
    expect(component.state.employers).toEqual([employer]);
  });

  it('onEdited', () => {
    component.onEdited(employer);

    expect(component.launchEditModal).toBeFalsy();
    expect(component.selectedEmployer).toBeNull();
    expect(component.state.employers).toEqual([employer]);
  });

  it('onDeleted', () => {
    component.onDeleted(1);
    expect(component.deleteEmployer).toBeNull();
    expect(component.state.employers).toEqual([]);
  });

  it('should launch create modal', () => {
    expect(component.launchCreateModal).toBeFalsy();
    component.onLaunchCreateModal();
    expect(component.launchCreateModal).toBeTruthy();
  });

  it(
    'should fetch list of employers',
    fakeAsync(() => {
      spy = spyOn(component.service, 'getEmployers').and.returnValue(observableOf(mockEmployers));
      component.ngOnInit();

      tick();
      expect(spy.calls.count()).toBe(1);
      expect(component.state.employers.length).toEqual(mockEmployers.length);
      expect(spy).toHaveBeenCalledWith(component.startRange, component.endRange, search);
    })
  );
});