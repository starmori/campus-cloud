import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of as observableOf } from 'rxjs';

import { EventsModule } from '../events.module';
import { EventsService } from '../events.service';
import { CPTestModule } from '@campus-cloud/shared/tests';
import { EventUtilService } from '../events.utils.service';
import { mockEvent } from '@controlpanel/manage/events/tests';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { EventsAttendanceComponent } from './events-attendance.component';
import { isClubAthletic } from '../../../settings/team/team.utils.service';

class MockService {
  dummy;

  updateEvent(body: any, id: number, search: any) {
    this.dummy = [body, id, search];

    return observableOf({});
  }

  getEventById(id: number, search: any) {
    this.dummy = [id, search];

    return observableOf({});
  }

  getEventAttendanceByEventId(startRange: number, endRange: number, search: any) {
    this.dummy = [startRange, endRange, search];

    return observableOf({});
  }
}

describe('EventAttendanceComponent', () => {
  let spy;
  let search;
  let spyAttendee;
  let component: EventsAttendanceComponent;
  let fixture: ComponentFixture<EventsAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CPTestModule, EventsModule, RouterTestingModule],
      providers: [
        EventUtilService,
        provideMockStore(),
        { provide: EventsService, useClass: MockService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: observableOf({ eventId: 1001 })
            }
          }
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(EventsAttendanceComponent);

        component = fixture.componentInstance;
        component.eventId = 1001;
        component.loading = false;
        component.attendeesLoading = false;
        component.session.g.set('school', mockSchool);
        component.session.g.set('user', { school_level_privileges: {} });

        component.event = {
          id: 5125,
          store_id: 125,
          title: 'Hello World!'
        };

        search = new HttpParams()
          .set('event_id', component.event.id)
          .set('sort_field', component.state.sortField)
          .set('search_text', component.state.searchText)
          .set('sort_direction', component.state.sortDirection);

        spyOn(component, 'buildHeader');
        spyOn(component, 'trackQrCode');
        spy = spyOn(component.service, 'getEventById').and.returnValue(observableOf(mockEvent));
        spyAttendee = spyOn(component.service, 'getEventAttendanceByEventId').and.returnValue(
          observableOf({})
        );
      });
  }));

  it('HttpParams does not include calendar_id or school_id', () => {
    component.fetch();
    const _search = new HttpParams();
    expect(spy).toHaveBeenCalledWith(component.eventId, _search);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('HttpParams includes calendar_id and school_id', () => {
    component.orientationId = 5425;

    const _search = new HttpParams()
      .set('school_id', component.session.g.get('school').id)
      .set('calendar_id', component.orientationId.toString());

    component.fetch();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(component.eventId, _search);
  });

  it('should fetch event attendees by event Id', () => {
    component.fetchAttendees();

    expect(spyAttendee).toHaveBeenCalledTimes(1);
    expect(spyAttendee).toHaveBeenCalledWith(component.startRange, component.endRange, search);
  });

  it('should fetch orientation event attendees by event Id', () => {
    component.isOrientation = true;
    component.orientationId = 1001;

    const _search = new HttpParams()
      .set('event_id', component.event.id)
      .set('sort_field', component.state.sortField)
      .set('search_text', component.state.searchText)
      .set('sort_direction', component.state.sortDirection)
      .set('school_id', component.session.g.get('school').id)
      .set('calendar_id', component.orientationId.toString());

    component.fetchAttendees();

    expect(spyAttendee).toHaveBeenCalledTimes(1);
    expect(spyAttendee).toHaveBeenCalledWith(component.startRange, component.endRange, _search);
  });

  it('onToggleQr - Enable QR', () => {
    spyOn(component, 'onSuccessQRCheckInMessage');
    const spyToggle = spyOn(component.service, 'updateEvent').and.returnValue(observableOf({}));

    component.event = {
      ...component.event,
      attend_verification_methods: [1, 2]
    };

    const data = {
      ...component.event,
      attend_verification_methods: [1, 2, 3]
    };

    search = new HttpParams();

    component.onToggleQr(false);

    expect(spyToggle).toHaveBeenCalled();
    expect(spyToggle).toHaveBeenCalledTimes(1);
    expect(component.onSuccessQRCheckInMessage).toHaveBeenCalled();
    expect(spyToggle).toHaveBeenCalledWith(data, component.eventId, search);
    expect(component.onSuccessQRCheckInMessage).toHaveBeenCalledTimes(1);
  });

  it('onToggleQr - Disable QR', () => {
    spyOn(component, 'onSuccessQRCheckInMessage');
    spy = spyOn(component.service, 'updateEvent').and.returnValue(observableOf({}));

    component.event = {
      ...component.event,
      attend_verification_methods: [1, 2, 3]
    };

    const data = {
      ...component.event,
      attend_verification_methods: [1, 2]
    };

    search = new HttpParams();

    component.onToggleQr(true);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.onSuccessQRCheckInMessage).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(data, component.eventId, search);
    expect(component.onSuccessQRCheckInMessage).toHaveBeenCalledTimes(1);
  });

  it('messageAttendee', () => {
    component.ngOnInit();
    component.canMessage = false;

    const tooltipText = component.cpI18n.translate(
      't_events_attendance_no_permission_tooltip_text'
    );

    component.messageAttendee(null);

    expect(component.messageAttendeesTooltipText).toBe(tooltipText);

    component.canMessage = true;

    const data = {
      firstname: 'Hello',
      lastname: 'World!',
      user_id: 1254
    };

    const messageData = {
      userIds: [1254],
      storeId: 125,
      name: 'Hello World!'
    };

    component.messageAttendee(data);

    expect(component.allStudents).toBeFalsy();
    expect(component.isSendMessageModal).toBeTruthy();
    expect(component.messageData).toEqual(messageData);
  });

  it('messageAllAttendees', () => {
    component.ngOnInit();
    component.canMessage = false;

    const tooltipText = component.cpI18n.translate(
      't_events_attendance_no_permission_tooltip_text'
    );

    component.messageAttendee(null);

    expect(component.messageAttendeesTooltipText).toBe(tooltipText);

    component.canMessage = true;

    component.attendees = [
      {
        user_id: 1234
      },
      {
        user_id: 1245
      }
    ];

    const messageData = {
      name: 'Hello World!',
      userIds: [1234, 1245],
      storeId: 125
    };

    component.messageAllAttendees();

    expect(component.allStudents).toBeTruthy();
    expect(component.isSendMessageModal).toBeTruthy();
    expect(component.messageData).toEqual(messageData);
  });

  it('should set showStudentIds true', () => {
    component.session.g.set('user', {
      school_level_privileges: { 157: { 33: { r: true, w: true } } }
    });
    component.session.g.set('school', {
      id: 157,
      has_sso_integration: true
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(true);

    component.isClub = true;
    component.session.g.set('user', {
      school_level_privileges: { 157: { 22: { r: true, w: true } } }
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(true);

    component.isClub = false;
    component.isService = true;
    component.session.g.set('user', {
      school_level_privileges: { 157: { 24: { r: true, w: true } } }
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(true);

    component.isService = false;
    component.athleticId = isClubAthletic.athletic;
    component.session.g.set('user', {
      school_level_privileges: { 157: { 28: { r: true, w: true } } }
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(true);

    component.athleticId = isClubAthletic.club;
    component.isOrientation = true;
    component.session.g.set('user', {
      school_level_privileges: { 157: { 17: { r: true, w: true } } }
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(true);
  });

  it('should set showStudentIds false', () => {
    component.session.g.set('user', {
      school_level_privileges: { 157: { 22: { r: true, w: true } } }
    });
    component.session.g.set('school', {
      id: 157,
      has_sso_integration: true
    });
    component.ngOnInit();
    expect(component.showStudentIds).toBe(false);
  });

  it('should get all for download', () => {
    const excelSpy = spyOn(component.utils, 'createExcel');
    component.onCreateExcel();

    const params = component.getAttendeesSearch().set('all', '1');

    expect(spyAttendee).toHaveBeenCalledTimes(1);
    expect(spyAttendee).toHaveBeenCalledWith(component.startRange, component.endRange, params);
    expect(excelSpy).toHaveBeenCalledTimes(1);
  });
});
