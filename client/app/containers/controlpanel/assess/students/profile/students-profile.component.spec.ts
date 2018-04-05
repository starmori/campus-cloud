import { mockSchool } from './../../../../../session/mock/school';
/*
 * Testing a simple Angular 2 component
 * More info: https://angular.io/docs/ts/latest/guide/testing.html#!#simple-component-test
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import 'rxjs';

// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import { StudentsService } from './../students.service';
import { CPSession } from './../../../../../session/index';
import { mockUser } from './../../../../../session/mock/user';
import { MockCPSession } from './../../../../../session/mock/session';
import { SharedModule } from './../../../../../shared/shared.module';
import { StudentsProfileComponent } from './students-profile.component';
import { snackBarReducer, headerReducer } from '../../../../../reducers';
import { CPI18nService } from './../../../../../shared/services/i18n.service';

class MockHttp {}

const mockStudentsService = {
  getStudentById() {
    return Observable.of(mockUser);
  },

  getEngagements() {
    return Observable.of([
      {
        related_id: 168428,
        user_feedback_text: 'safety',
        name: 'Mock Name 1',
        user_rating_percent: 100,
        checkin_id: 1,
        time_epoch: 1467907902,
        rating_scale_maximum: 5,
        type: 'event',
        feedback_time_epoch: 1469024496
      },
      {
        related_id: 1483825,
        user_feedback_text: '',
        name: 'Mock name 2',
        user_rating_percent: 20,
        checkin_id: 121,
        time_epoch: 1471644492,
        rating_scale_maximum: 5,
        type: 'event',
        feedback_time_epoch: 1471877917
      }
    ]);
  }
};

describe('StudentsProfileComponent', () => {
  let store: Store<any>;
  let service;
  let fixture: ComponentFixture<StudentsProfileComponent>;
  let comp: StudentsProfileComponent;
  // let el;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentsProfileComponent],
      imports: [
        SharedModule,
        StoreModule.forRoot({
          HEADER: headerReducer,
          SNACKBAR: snackBarReducer
        })
      ],
      providers: [
        CPI18nService,
        { provide: CPSession, useClass: MockCPSession },
        { provide: Http, useClass: MockHttp },
        { provide: StudentsService, useValue: mockStudentsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: Observable.of({ studentId: 1 })
            }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    store = TestBed.get(Store);
    service = TestBed.get(StudentsService);

    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(StudentsProfileComponent);
    comp = fixture.componentInstance;
    comp.session.g.set('school', mockSchool);

    comp.studentId = 1;
    // fixture.detectChanges();
  });

  it('should teardown compose', () => {
    comp.onComposeTeardown();

    expect(comp.messageData).toBeFalsy();
    expect(comp.isStudentComposeModal).toBeFalsy();
  });

  it('should flash success message', () => {
    const expected = {
      class: 'success',
      autoClose: true,
      sticky: false,
      autoCloseDelay: 4000,
      body: 'Success! Your message has been sent'
    };

    comp.fetchStudentData();

    comp.onFlashMessage();

    store.select('SNACKBAR').subscribe((payload) => expect(payload).toEqual(expected));
  });

  it('should launchMessageModal', () => {
    comp.fetchStudentData();
    fixture.detectChanges();

    const mockMessageData = {
      name: `${mockUser.firstname} ${mockUser.lastname}`,
      userIds: [mockUser.id]
    };

    comp.launchMessageModal();

    expect(comp.messageData).toEqual(mockMessageData);
    expect(comp.isStudentComposeModal).toBeTruthy();
  });

  it('loadingStudentData should be set', () => {
    expect(comp.loadingStudentData).toBeTruthy();
  });

  it('should update student to match mocked service', () => {
    comp.fetchStudentData();
    fixture.detectChanges();
    expect(comp.student).toEqual(mockUser);
    expect(comp.loadingStudentData).toBeFalsy();
  });

  it('should populate header', () => {
    const expected = {
      heading: '[NOTRANSLATE]Mock User[NOTRANSLATE]',
      subheading: null,
      em: null,
      crumbs: { url: 'students', label: 'students' },
      children: []
    };
    comp.fetchStudentData();

    store.select('HEADER').subscribe((payload) => {
      expect(payload).toEqual(expected);
    });
  });

  it('Spy on real service test', (done) => {
    const spy = spyOn(service, 'getStudentById').and.returnValue(Observable.of('Sopa'));

    fixture.detectChanges();
    spy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });
});
