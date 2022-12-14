import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { CPSession } from '@campus-cloud/session';
import { AdminService } from '@campus-cloud/shared/services';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { mockAttendees } from '@controlpanel/manage/events/tests';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { EventsModel } from '@controlpanel/manage/events/model/events.model';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { EventsAssessmentFormComponent } from './events-assessment-form.component';
import { EventUtilService } from '@controlpanel/manage/events/events.utils.service';
import {
  CheckInMethod,
  EventAttendance,
  EventFeedback,
  SelfCheckInOption
} from '../../../event.status';
import { CPI18nPipe } from '@campus-cloud/shared/pipes';

describe('EventsAssessmentFormComponent', () => {
  configureTestSuite();

  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        declarations: [EventsAssessmentFormComponent],
        providers: [AdminService, EventUtilService, CPI18nPipe],
        imports: [CPTestModule],
        schemas: [NO_ERRORS_SCHEMA]
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let session;
  let fixture: ComponentFixture<EventsAssessmentFormComponent>;
  let component: EventsAssessmentFormComponent;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EventsAssessmentFormComponent);
    component = fixture.componentInstance;

    session = TestBed.get(CPSession);
    session.g.set('school', mockSchool);
    component.form = EventsModel.form(false);
  }));

  it('should toggle SelfCheckIn option values onSelectedCheckInMethods', () => {
    let result;
    component.form
      .get('attend_verification_methods')
      .setValue([CheckInMethod.web,
        CheckInMethod.deepLink]);

    component.onSelectedCheckInMethods([SelfCheckInOption.appLink, SelfCheckInOption.qr]);

    result = component.form.get('attend_verification_methods').value;

    expect(result).toEqual([
      CheckInMethod.web,
      CheckInMethod.deepLink,
      CheckInMethod.app
    ]);

    component.onSelectedCheckInMethods([SelfCheckInOption.appLink, SelfCheckInOption.qr, SelfCheckInOption.email]);

    result = component.form.get('attend_verification_methods').value;

    expect(result).toEqual([
      CheckInMethod.web,
      CheckInMethod.deepLink,
      CheckInMethod.app,
      CheckInMethod.userWebEntry
    ]);
  });

  it('should reset event attendance & Check-in methods value on toggleEventAttendance', () => {
    const feedbackQuestion = component.cpI18n.translate('t_events_default_feedback_question');
    component.attendanceFeedbackLabel = feedbackQuestion;

    component.toggleEventAttendance(true);

    const feedback = component.form.get('event_feedback').value;
    const eventAttendance = component.form.get('event_attendance').value;
    const feedbackLabel = component.form.get('custom_basic_feedback_label').value;
    const attend_methods = component.form.get('attend_verification_methods').value;

    expect(feedbackLabel).toBe(feedbackQuestion);
    expect(feedback).toBe(EventFeedback.enabled);
    expect(eventAttendance).toBe(EventAttendance.enabled);
    expect(attend_methods).toEqual([CheckInMethod.web, CheckInMethod.deepLink, CheckInMethod.app, CheckInMethod.userWebEntry]);
  });

  it('should set feedback status & question onEventFeedbackChange', () => {
    const feedbackQuestion = component.cpI18n.translate('t_events_default_feedback_question');

    const option = {
      action: true
    };

    component.onEventFeedbackChange(option);

    const feedback = component.form.get('event_feedback').value;
    const feedbackLabel = component.form.get('custom_basic_feedback_label').value;

    expect(feedback).toBe(true);
    expect(feedbackLabel).toBe(feedbackQuestion);
  });

  it('should fetch managers by store id if not orientation event', () => {
    const storeId = 12;
    const params: HttpParams = new HttpParams()
      .append('school_id', session.g.get('school').id.toString())
      .append('privilege_type', CP_PRIVILEGES_MAP.events.toString())
      .append('store_id', storeId.toString());

    const spy = spyOn(component.adminService, 'getAdminByStoreId').and.returnValue(
      of(mockAttendees)
    );

    component.fetchManagersBySelectedStore(storeId.toString());

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(params);
  });

  it('should fetch managers without store id for orientation event', () => {
    const storeId = 12;
    component.isOrientation = true;
    const params: HttpParams = new HttpParams()
      .append('school_id', session.g.get('school').id.toString())
      .append('privilege_type', CP_PRIVILEGES_MAP.orientation.toString());

    const spy = spyOn(component.adminService, 'getAdminByStoreId').and.returnValue(
      of(mockAttendees)
    );

    component.fetchManagersBySelectedStore(storeId);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(params);
  });
});
