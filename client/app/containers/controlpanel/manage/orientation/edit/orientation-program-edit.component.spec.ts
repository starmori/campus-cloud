import { HttpParams } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of as observableOf } from 'rxjs';
import { CPSession } from './../../../../../session';
import { OrientationProgramEditComponent } from './orientation-program-edit.component';
import { headerReducer, snackBarReducer } from '../../../../../reducers';
import { mockSchool } from '../../../../../session/mock/school';
import { CPI18nService } from '../../../../../shared/services/i18n.service';
import { OrientationDetailsModule } from '../details/orientation-details.module';
import { OrientationService } from '../orientation.services';
import { OrientationUtilsService } from '../orientation.utils.service';

class MockOrientationService {
  dummy;

  editProgram(programId: number, body: any, search: any) {
    this.dummy = [programId, body, search];

    return observableOf({});
  }
}

describe('OrientationProgramEditComponent', () => {
  let spy;
  let search;
  let storeSpy;
  let store: Store<any>;
  let component: OrientationProgramEditComponent;
  let service: OrientationService;
  let fixture: ComponentFixture<OrientationProgramEditComponent>;

  const editProgram = {
    id: 84,
    name: 'This is new edited name',
    description: 'this is new edited description',
    events: 20,
    members: 30,
    start: '1557637200',
    end: '1557637200',
    has_membership: 1
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          OrientationDetailsModule,
          RouterTestingModule,
          StoreModule.forRoot({
            HEADER: headerReducer,
            SNACKBAR: snackBarReducer
          })
        ],
        providers: [
          CPSession,
          FormBuilder,
          CPI18nService,
          OrientationUtilsService,
          { provide: OrientationService, useClass: MockOrientationService }
        ]
      })
        .compileComponents()
        .then(() => {
          store = TestBed.get(Store);
          storeSpy = spyOn(store, 'dispatch').and.callThrough();
          fixture = TestBed.createComponent(OrientationProgramEditComponent);
          component = fixture.componentInstance;
          service = TestBed.get(OrientationService);

          component.session.g.set('school', mockSchool);

          search = new HttpParams().append(
            'school_id',
            component.session.g.get('school').id.toString()
          );

          component.orientationProgram = {
            id: 84,
            name: 'This is new edited name',
            description: 'this is new edited description',
            events: 20,
            members: 30,
            start: 1557637200,
            end: 1557637200,
            has_membership: 1
          };
          component.ngOnInit();
        });
    })
  );

  it('form validation - should fail', () => {
    component.form.controls['name'].setValue(null);
    expect(component.form.valid).toBeFalsy();
  });

  it('form validation - should pass', () => {
    expect(component.form.valid).toBeTruthy();
  });

  it('form validation - max length 225 - should fail', () => {
    const charCount226 = 'a'.repeat(226);

    component.form.controls['name'].setValue(charCount226);
    expect(component.form.valid).toBeFalsy();
  });

  it('cp button should have disabled state TRUE', () => {
    component.form.controls['name'].setValue(null);
    expect(component.buttonData.disabled).toBeTruthy();
  });

  it('cp button should have disabled state FALSE', () => {
    expect(component.buttonData.disabled).toBeFalsy();
  });

  it('should update orientation program', () => {
    spyOn(component, 'resetModal');
    spy = spyOn(component.service, 'editProgram').and.returnValue(observableOf(editProgram));

    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.count()).toBe(1);
  });
});
