import { AbstractControl } from '@angular/forms';
import { Injectable } from '@angular/core';

import IEvent from './event.interface';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { CPAmplitudeService } from '@campus-cloud/shared/services';
import IServiceProvider from '@controlpanel/manage/services/providers.interface';
import { EventFeedback, Feedback, CheckInMethod, EventCategory } from './event.status';

@Injectable()
export class EventsAmplitudeService {
  static getPropertyStatus(value) {
    return value ? amplitudeEvents.YES : amplitudeEvents.NO;
  }

  static getCheckOutStatus(data) {
    return data['has_checkout'] ? amplitudeEvents.ENABLED : amplitudeEvents.DISABLED;
  }

  static getEventType(value) {
    return value ? amplitudeEvents.FEED_INTEGRATION : amplitudeEvents.MANUAL;
  }

  static getEventDescriptionStatus(control: AbstractControl) {
    return !control.value
      ? amplitudeEvents.NO_DESCRIPTION
      : control.dirty
      ? amplitudeEvents.ADDED_DESCRIPTION
      : amplitudeEvents.NO_CHANGES;
  }

  static getFeedbackStatus(event) {
    return !event.event_attendance
      ? amplitudeEvents.NOT_APPLICABLE
      : event.event_feedback === EventFeedback.enabled
      ? Feedback.enabled
      : Feedback.disabled;
  }

  static getQRCodeStatus(data: IEvent | IServiceProvider, isEvent = false) {
    const verificationMethod = isEvent
      ? data['attend_verification_methods']
      : data['checkin_verification_methods'];

    return verificationMethod.includes(CheckInMethod.app)
      ? amplitudeEvents.ENABLED
      : amplitudeEvents.DISABLED;
  }

  static getDateStatus(event: IEvent) {
    if (event.start && event.end) {
      return amplitudeEvents.START_END_DATE;
    } else if (event.start) {
      return amplitudeEvents.START_DATE;
    } else if (event.end) {
      return amplitudeEvents.END_DATE;
    } else {
      return amplitudeEvents.NO_DATE;
    }
  }

  static getEventCategoryType(category: Number) {
    if (category === EventCategory.athletics) {
      return amplitudeEvents.ATHLETIC_EVENT;
    } else if (category === EventCategory.club) {
      return amplitudeEvents.CLUB_EVENT;
    } else if (category === EventCategory.services) {
      return amplitudeEvents.SERVICE_EVENT;
    } else {
      return amplitudeEvents.ORIENTATION_EVENT;
    }
  }

  static getEventProperties(event: IEvent) {
    const feedback = EventsAmplitudeService.getFeedbackStatus(event);

    const qr_code_status = !event.event_attendance
      ? amplitudeEvents.NOT_APPLICABLE
      : this.getQRCodeStatus(event, true);

    const assessment_status = !event.event_attendance
      ? amplitudeEvents.NO_ASSESSMENT
      : event.has_checkout
      ? amplitudeEvents.CHECKIN_AND_CHECKOUT
      : amplitudeEvents.CHECKIN_ONLY;

    const hostType = CPAmplitudeService.storeCategoryIdToAmplitudeName(event.store_category);
    const host_type = hostType ? hostType : amplitudeEvents.ORIENTATION;

    return {
      feedback,
      host_type,
      qr_code_status,
      assessment_status,
      event_id: event.id,
      location: this.getPropertyStatus(event.address),
      description: this.getPropertyStatus(event.description)
    };
  }

  static getQRCodeCheckOutStatus(data: IEvent | IServiceProvider, isEvent = false) {
    return {
      check_out_status: this.getCheckOutStatus(data),
      qr_code_status: this.getQRCodeStatus(data, isEvent)
    };
  }
}
